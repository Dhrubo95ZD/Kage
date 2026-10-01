"""Retain combat clips, strip atlas images, and repack only referenced buffers."""
import json,struct,sys
from pathlib import Path
KEEP={'Idle','Running_A','Running_B','Walking_A','1H_Melee_Attack_Chop','1H_Melee_Attack_Slice_Diagonal','1H_Melee_Attack_Slice_Horizontal','1H_Melee_Attack_Stab','2H_Melee_Attack_Chop','2H_Melee_Attack_Stab','2H_Melee_Attack_Slice','2H_Melee_Attack_Spin','2H_Melee_Attack_Spinning','Dualwield_Melee_Attack_Chop','Dualwield_Melee_Attack_Slice','Dualwield_Melee_Attack_Stab','Dodge_Forward','Dodge_Backward','Hit_A','Hit_B','Death_A','Death_B','Jump_Start','Jump_Idle','Jump_Land','1H_Ranged_Aiming','1H_Ranged_Shoot','1H_Ranged_Shooting','2H_Melee_Idle'}
def convert(source,destination):
    b=Path(source).read_bytes();n=struct.unpack_from('<I',b,12)[0];doc=json.loads(b[20:20+n]);binary=b[28+n:]
    doc['animations']=[a for a in doc.get('animations',[]) if a['name'] in KEEP]
    for mat in doc.get('materials',[]):
        mat.clear();mat.update({'name':'ShadowMaterial','pbrMetallicRoughness':{'baseColorFactor':[.12,.14,.17,1],'metallicFactor':.15,'roughnessFactor':.8}})
    doc.pop('images',None);doc.pop('textures',None);doc.pop('samplers',None)
    used=set()
    for mesh in doc['meshes']:
        for p in mesh['primitives']:
            used.update(p['attributes'].values())
            if 'indices' in p:used.add(p['indices'])
            for t in p.get('targets',[]):used.update(t.values())
    for skin in doc.get('skins',[]):
        if 'inverseBindMatrices' in skin:used.add(skin['inverseBindMatrices'])
    for a in doc['animations']:
        for s in a['samplers']:used.update([s['input'],s['output']])
    mapping={old:new for new,old in enumerate(sorted(used))}
    accessors=[doc['accessors'][i] for i in sorted(used)]
    views=set(a['bufferView'] for a in accessors if 'bufferView' in a)
    vmap={old:new for new,old in enumerate(sorted(views))};buf=bytearray();newviews=[]
    for i in sorted(views):
        v=dict(doc['bufferViews'][i]);offset=v.get('byteOffset',0);payload=binary[offset:offset+v['byteLength']]
        while len(buf)%4:buf.append(0)
        v['buffer']=0;v['byteOffset']=len(buf);buf.extend(payload);newviews.append(v)
    for a in accessors:
        if 'bufferView' in a:a['bufferView']=vmap[a['bufferView']]
    for mesh in doc['meshes']:
        for p in mesh['primitives']:
            p['attributes']={k:mapping[v] for k,v in p['attributes'].items()}
            if 'indices' in p:p['indices']=mapping[p['indices']]
            for t in p.get('targets',[]):
                for k in t:t[k]=mapping[t[k]]
    for skin in doc.get('skins',[]):
        if 'inverseBindMatrices' in skin:skin['inverseBindMatrices']=mapping[skin['inverseBindMatrices']]
    for a in doc['animations']:
        for s in a['samplers']:s['input']=mapping[s['input']];s['output']=mapping[s['output']]
    doc['accessors']=accessors;doc['bufferViews']=newviews;doc['buffers']=[{'byteLength':len(buf)}]
    while len(buf)%4:buf.append(0)
    data=json.dumps(doc,separators=(',',':')).encode();data+=b' '*((-len(data))%4)
    glb=struct.pack('<III',0x46546c67,2,28+len(data)+len(buf))+struct.pack('<II',len(data),0x4e4f534a)+data+struct.pack('<II',len(buf),0x004e4942)+buf
    Path(destination).write_bytes(glb);print(f'{destination}: {len(b):,} → {len(glb):,} bytes; {len(doc["animations"])} clips')
for name in ['shadow','guard']:convert(Path(sys.argv[1])/f'{name}.glb',Path('public/models')/f'{name}.glb')
