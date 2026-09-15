"""Genera los ZIP para instalación manual y Chrome Web Store.

Cada entrada lleva la misma fecha (1980-01-01), los mismos permisos y la misma compresión,
así que los ZIP dependen solo del contenido de los archivos: el mismo commit genera siempre
los mismos bytes.
"""

import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

raiz = Path(__file__).resolve().parent.parent
manifiesto = json.loads((raiz / "manifest.json").read_text(encoding="utf-8"))
version = manifiesto["version"]
archivos = [raiz / nombre for nombre in ("manifest.json", "content.js", "content.css", "LICENSE", "icons/ORIGEN.md")]
archivos.extend(sorted((raiz / "icons").glob("*.png")))

nombre = f"promiedos-plus-{version}"
formatos = (
    (f"{nombre}.zip", Path(nombre)),
    (f"{nombre}-chrome-web-store.zip", Path()),
)

for nombre_zip, carpeta in formatos:
    destino = raiz / "dist" / nombre_zip
    destino.parent.mkdir(exist_ok=True)
    with ZipFile(destino, "w") as paquete:
        for archivo in archivos:
            entrada = ZipInfo((carpeta / archivo.relative_to(raiz)).as_posix(), date_time=(1980, 1, 1, 0, 0, 0))
            entrada.create_system = 3
            entrada.external_attr = 0o644 << 16
            paquete.writestr(entrada, archivo.read_bytes(), ZIP_DEFLATED, 9)

    with ZipFile(destino) as paquete:
        assert paquete.testzip() is None, "El ZIP no superó la verificación de integridad."
        assert (carpeta / "manifest.json").as_posix() in paquete.namelist(), "Falta el manifiesto en la carpeta esperada."
        assert paquete.read((carpeta / "LICENSE").as_posix()) == (raiz / "LICENSE").read_bytes(), "Falta la licencia completa en el paquete."

    print(f"Paquete generado: {destino}")
