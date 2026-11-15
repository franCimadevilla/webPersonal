"""Servidor local de la prueba de usabilidad (eye tracking + Hotjar).

Sirve la raíz del repositorio igual que `python -m http.server` y además:

  POST /api/eyetracking/sesiones/<archivo>   guarda un .json/.mp4/.webm de la sesión
  GET  /api/eyetracking/sesiones             lista las sesiones guardadas

Los archivos van a tests/usabilidad/eyetracking/, así no dependen de la carpeta
de descargas del navegador. Solo atiende peticiones desde este equipo.

    python tests/eyetracking/servidor.py [puerto]
"""

import functools
import ipaddress
import json
import re
import socket
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
DESTINO = RAIZ / "tests" / "usabilidad" / "eyetracking"
API = "/api/eyetracking/sesiones"
NOMBRE_VALIDO = re.compile(r"^et-[A-Za-z0-9_-]{1,120}\.(json|mp4|webm)$")
MAX_BYTES = 2 * 1024 ** 3  # 2 GB por archivo
EXT_VIDEO = (".mp4", ".webm")


class Manejador(SimpleHTTPRequestHandler):
    def _es_local(self):
        host = self.client_address[0]
        try:
            ip = ipaddress.ip_address(host)
            if ip.version == 6 and ip.ipv4_mapped:
                ip = ip.ipv4_mapped
            return ip.is_loopback
        except ValueError:
            return False

    def _json(self, codigo, datos):
        cuerpo = json.dumps(datos, ensure_ascii=False).encode("utf-8")
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(cuerpo)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(cuerpo)

    def end_headers(self):
        # Sin caché: al repetir una prueba se ve siempre la última versión del sitio.
        if not self.path.startswith(API):
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def do_GET(self):
        if not self._es_local():
            return self.send_error(403, "Solo desde este equipo")
        ruta = self.path.split("?")[0]
        if ruta == API:
            return self._json(200, listar_sesiones())
        if ruta.startswith(API + "/"):
            nombre = ruta[len(API) + 1:]
            archivo = DESTINO / nombre
            if not nombre.endswith(".json") or not NOMBRE_VALIDO.match(nombre) or not archivo.is_file():
                return self.send_error(404)
            cuerpo = archivo.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(cuerpo)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(cuerpo)
            return None
        return super().do_GET()

    def do_HEAD(self):
        if not self._es_local():
            return self.send_error(403, "Solo desde este equipo")
        return super().do_HEAD()

    def do_POST(self):
        if not self._es_local():
            return self.send_error(403, "Solo desde este equipo")
        if not self.path.startswith(API + "/"):
            return self.send_error(404)
        nombre = self.path[len(API) + 1:].split("?")[0]
        if not NOMBRE_VALIDO.match(nombre):
            return self._json(400, {"error": "Nombre de archivo no válido"})
        try:
            longitud = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            longitud = 0
        if longitud <= 0 or longitud > MAX_BYTES:
            return self._json(400, {"error": "Tamaño no válido"})

        DESTINO.mkdir(parents=True, exist_ok=True)
        final = DESTINO / nombre
        temporal = final.with_name(final.name + ".parcial")
        restante = longitud
        with open(temporal, "wb") as f:
            while restante > 0:
                trozo = self.rfile.read(min(1024 * 1024, restante))
                if not trozo:
                    break
                f.write(trozo)
                restante -= len(trozo)
        if restante:
            temporal.unlink(missing_ok=True)
            return self._json(400, {"error": "Subida incompleta"})
        temporal.replace(final)
        self.log_message("Guardado %s (%d bytes)", final, longitud)
        return self._json(201, {"archivo": ruta_legible(final)})


def ruta_legible(ruta):
    try:
        return ruta.relative_to(RAIZ).as_posix()
    except ValueError:
        return str(ruta)


def listar_sesiones():
    sesiones = []
    if not DESTINO.exists():
        return sesiones
    for archivo in sorted(DESTINO.glob("et-*.json"), reverse=True):
        try:
            d = json.loads(archivo.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        base = archivo.stem
        video = next((base + e for e in EXT_VIDEO if (DESTINO / (base + e)).exists()), None)
        paginas = sorted({m.get("p") for m in d.get("muestras", []) if m.get("p")})
        sesiones.append({
            "marca": d.get("marca") or base,
            "json": archivo.name,
            "video": video,
            "participante": d.get("participante"),
            "tarea": d.get("tarea"),
            "inicio": d.get("inicio"),
            "duracionMs": d.get("duracionMs"),
            "precision": (d.get("precision") or {}).get("pct"),
            "muestras": len(d.get("muestras", [])),
            "viewport": d.get("viewport"),
            "paginas": paginas,
        })
    return sesiones


class ServidorDual(ThreadingHTTPServer):
    """IPv6 e IPv4 a la vez, para que 'localhost' funcione resuelva como resuelva."""

    address_family = socket.AF_INET6

    def server_bind(self):
        try:
            self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        except (AttributeError, OSError):
            pass
        super().server_bind()


def main():
    puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
    manejador = functools.partial(Manejador, directory=str(RAIZ))
    try:
        servidor = ServidorDual(("::", puerto), manejador)
    except OSError:
        servidor = ThreadingHTTPServer(("127.0.0.1", puerto), manejador)
    print(f"Sirviendo {RAIZ} en http://localhost:{puerto}/ (sesiones en {DESTINO})", flush=True)
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
