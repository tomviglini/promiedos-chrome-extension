"""Genera los ZIP para instalación manual y Chrome Web Store."""

import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

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
    with ZipFile(destino, "w", ZIP_DEFLATED) as paquete:
        for archivo in archivos:
            ruta_interna = (carpeta / archivo.relative_to(raiz)).as_posix()
            paquete.write(archivo, ruta_interna)

    with ZipFile(destino) as paquete:
        assert paquete.testzip() is None, "El ZIP no superó la verificación de integridad."
        assert (carpeta / "manifest.json").as_posix() in paquete.namelist(), "Falta el manifiesto en la carpeta esperada."
        assert paquete.read((carpeta / "LICENSE").as_posix()) == (raiz / "LICENSE").read_bytes(), "Falta la licencia completa en el paquete."

    print(f"Paquete generado: {destino}")
