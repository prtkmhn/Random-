import xml
from xml.dom.minidom import parse

data = {}
keys = []

ways = {}
wkeys = []

relations = {}
rkeys = []

xmls = [r"c:\temp\small.osm"]
for f in xmls:
    dom = xml.dom.minidom.parse(f)
    #  parse out osm nodes
    #
    for n in dom.getElementsByTagName("node"):
        nid = n.getAttribute("id")
        data[nid] = {}
        data[nid]["lat"] = n.getAttribute("lat")
        data[nid]["lon"] = n.getAttribute("lon")
        for tag in n.getElementsByTagName("tag"):
            if(tag.hasAttribute("k")):
                k = tag.getAttribute("k")
                if(k not in keys):
                    keys.append(k)
                if(tag.hasAttribute("v")):
                    data[nid][k] = tag.getAttribute("v")
    # parse out osm ways/polygons
    #
    for n in dom.getElementsByTagName("way"):
        wid = n.getAttribute("id")
        ways[wid] = {}
        ways[wid]['ref'] = []
        ways[wid]['geomType'] = ""
        for nd in n.getElementsByTagName('nd'):
            if nd.hasAttribute('ref'):
                ref = nd.getAttribute('ref')
                ways[wid]['ref'].append(ref)
            del nd
        for tag in n.getElementsByTagName("tag"):
            if tag.hasAttribute("k") and \
               tag.hasAttribute('v'):
                k = tag.getAttribute("k")
                if k not in wkeys:
                    wkeys.append(k)
                ways[wid][k] = tag.getAttribute('v')
            del tag
        first = ways[wid]['ref'][0]
        last = ways[wid]['ref'][len(ways[wid]['ref'])-1]
        if ways[wid]['ref'][0] == ways[wid]['ref'][len(ways[wid]['ref'])-1]:
            ways[wid]['geomType'] = "polygon"
        else:
            ways[wid]['geomType'] = "polyline"
    for n in dom.getElementsByTagName('relation'):
        rid = n.getAttribute('id')
        relations[rid] = {}
        relations[rid]['member'] = []
        for mem in n.getElementsByTagName('member'):
            member = {}
            if mem.hasAttribtue('type'):
                member['type'] = mem.getAttribute('type')
            if mem.hasAttribute('ref'):
                member['ref'] = mem.getAttribute('ref')
            if mem.hasAttribute('role'):
                member['role'] = mem.getAttribute('role')
            relations[rid]['member'].append(member)
            del mem
        for tag in mem.getElementsByTagName("tag"):
            if tag.hasAttribute("k") and \
               tag.hasAttribute('v'):
                k = tag.getAttribute("k")
                relations[rid][k] = tag.getAttribute('v')
            del tag
# do stuff with nodes, ways (lines), and polygons like converting the data from dictionaries to feature classes or shapefiles!
