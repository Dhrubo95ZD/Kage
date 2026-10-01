from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root=Path(__file__).resolve().parent.parent
out=root/'exports/kage-android-source.zip'
out.parent.mkdir(exist_ok=True)
with ZipFile(out,'w',ZIP_DEFLATED) as archive:
    for folder in ['android','src','public','dist','tests','scripts','worker','db','drizzle']:
        for p in sorted((root/folder).rglob('*')):
            if p.is_file() and not any(part in ['.gradle','build','__pycache__'] for part in p.relative_to(root).parts):
                archive.write(p,p.relative_to(root))
    for name in ['README.md','THIRD_PARTY_ASSETS.md','package.json','package-lock.json','vite.config.mjs','drizzle.config.ts','ARCHITECTURE.md']:
        archive.write(root/name,name)
print(f'{out.name}: {out.stat().st_size:,} bytes')
