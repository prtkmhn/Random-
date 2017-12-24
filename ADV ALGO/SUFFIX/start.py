#from tree_build import Documents
from pprint import pprint
#from suffix import SuffixTree
import sys

class nd():
    def __init__(self, id=-1, prntnd=None, depth=-1):
        self.id = id
        self.depth = depth
        self.sfxlnk = None
        self.tLinks = []
        self.prnt = prntnd
        self.g_index = {}


    def _has_trans(self, suffix):
        for nd,_suffix in self.tLinks:
            if _suffix == '__@__' or suffix == _suffix:
                return True
        return False

    def is_leaf(self):
        return self.tLinks == []

    def to_string(self):
        return("Snd: id:"+ str(self.id) + " depth:"+str(self.depth) +
            " transitons:" + str(self.tLinks))

    def _traverse(self, nn):
        for (n, _) in self.tLinks:
            n._traverse(nn)
        nn(self)

    def _get_leaves(self):
        if self.is_leaf():
            return list([self])
        else:
            return [q for (n,_) in self.tLinks for q in n._get_leaves()]

    def _add_sfxlnk(self, suffix_nd):
        self.sfxlnk = suffix_nd

    def _get_sfxlnk(self):
        if self.sfxlnk != None:
            return self.sfxlnk
        else:
            return False

    def _get_tLink(self, suffix):
        for nd,suff in self.tLinks:
            if suff == '__@__' or suffix == suff:
                return nd
        return False

    def _add_tLink(self, snd, suffix=''):
        tl = self._get_tLink(suffix)
        if tl: # TODO: imporve this.
            self.tLinks.remove((tl,suffix))
        self.tLinks.append((snd,suffix))

class SuffixTree():
    def __init__(self, ip=[]):
        self.root = nd()
        self.root.depth = 0
        self.root.id = 0
        self.root.prnt = self.root
        self.root._add_sfxlnk(self.root)
        self.terminals = (i for i in list(list(range(0xE000,0xF8FF+1)) + list(range(0xF0000,0xFFFFD+1)) + list(range(0x100000, 0x10FFFD+1))))

        if len(ip) != 0:
           self._build_tree(ip)

    def _build(self, q):
        self.word = q
        r = self.root
        wl = 0
        for i in range(len(q)):
            while r.depth == wl and r._has_trans(q[wl+i]):
                r = r._get_tLink(q[wl+i])
                wl = wl + 1
                while wl < r.depth and q[r.id + wl] == q[i + wl]:
                    wl = wl + 1
            if wl < r.depth:
                r = self._create_nd(q, r, wl)
            self._make_leaf(q, i, r, wl)
            if not r._get_sfxlnk():
                self._compute_sfxlnk(q, r)
            r = r._get_sfxlnk()
            wl = wl - 1
            if wl < 0:
                wl = 0

    def _create_nd(self, q, r, wl):
        i = r.id
        p = r.prnt
        v = nd(id=i, depth=wl)
        v._add_tLink(r,q[i+wl])
        r.prnt = v
        p._add_tLink(v, q[i+p.depth])
        v.prnt = p
        return v

    def _make_leaf(self, q, i, r, wl):
        w = nd()
        w.id = i
        w.depth = len(q) - i
        r._add_tLink(w, q[i + wl])
        w.prnt = r
        return w

    def _build_tree(self, ww):

        www = ''.join([q + chr(next(self.terminals)) for q in ww])
        self.word = www
        self.wordss(ww)
        self._build(www)
        self.root._traverse(self._label)

    def _label(self, nd):
        if nd.is_leaf():
            q = {self._word_start_index(nd.id)}
        else:
            q = {n for ns in nd.tLinks for n in ns[0].g_index}
        nd.g_index = q

    def _word_start_index(self, id):
        i = 0
        for _idx in self.word_starts[1:]:
            if id < _idx:
                return i
            else:
                i+=1
        return i

    def find(self, st):
        y_input = st
        nd = self.root
        while True:
            edge = self._edgeLabel(nd, nd.prnt)
            if edge.startswith(st):
                break

            i = 0
            while(i < len(edge) and edge[i] == st[0]):
                st = st[1:]
                i += 1

            if i != 0:
                if i == len(edge) and st != '':
                    pass
                else:
                    return []

            nd = nd._get_tLink(st[0])
            if not nd:
                return []

        leaves = nd._get_leaves()
        return [n.id for n in leaves]

    def wordss(self, w):
        self.word_starts = []
        i = 0
        for n in range(len(w)):
            self.word_starts.append(i)
            i += len(w[n]) + 1

    def lcs(self, S,T):
        m = len(S)
        n = len(T)
        counter = [[0]*(n+1) for x in range(m+1)]
        longest = 0
        lcs_set = set()
        for i in range(m):
            for j in range(n):
                if S[i] == T[j]:
                    c = counter[i][j] + 1
                    counter[i+1][j+1] = c
                    if c > longest:
                        lcs_set = set()
                        longest = c
                        lcs_set.add(S[i-c+1:i+1])
                    elif c == longest:
                        lcs_set.add(S[i-c+1:i+1])

        return lcs_set

    def _edgeLabel(self, nd, prnt):
        return self.word[nd.id + prnt.depth : nd.id + nd.depth]

    def _compute_sfxlnk(self, q, r):
        wl = r.depth
        v = r.prnt._get_sfxlnk()
        while v.depth < wl - 1:
            v = v._get_tLink(q[r.id + v.depth + 1])
        if v.depth > wl - 1:
            v = self._create_nd(q, v, wl-1)
        r._add_sfxlnk(v)







class Documents():
    def __init__(self, documents_dict):
        self.documents = documents_dict
        self.document_trees = {}
        self._build()

    def _build(self):
        for doc in self.documents:
            self.document_trees[doc] = SuffixTree([self.documents[doc]])

    def aia(self, query):
        "srch for all occurences"
        result = {}
        for doc in self.document_trees:
            matches = self.document_trees[doc].find(query)
            if len(matches) != 0:
                result[doc] = {}
            for i,match in enumerate(matches):
                fh = self.documents[doc][:match].split(".")[-1]
                lh = self.documents[doc][match:].split(".")[0]
                result[doc][i]  = fh+lh
        return result

    def oia(self, query):
        "srch for first occurence"
        result = {}
        for doc in self.document_trees:
            matches = self.document_trees[doc].find(query)
            if len(matches) != 0:
                result[doc] = []
            else:
                str = self.document_trees[doc].lcs(query, self.documents[doc])
                # str = list(str
                if len(str) != 0:
                    result[doc] = list(str)[0]
                continue
            for match in matches:
                fh = self.documents[doc][:match].split(".")[-1]
                lh = self.documents[doc][match:].split(".")[0]
                result[doc]  = fh+lh
                break
        return result

    def matcher(self, query):
        "relavance"
        exact_matches = self.aia(query)
        approx_matches = {}
        for doc in self.document_trees:
            matches = self.document_trees[doc].lcs(query, self.documents[doc])
            if len(matches) != 0:
                approx_matches[doc] = matches
        rel = []
        for doc in self.documents:
            cnt = 0
            if doc in exact_matches.keys():
                cnt +=10 * len(exact_matches[doc])
            if doc in approx_matches.keys():
                for ele in approx_matches[doc]:
                    if len(ele) > 3:
                        cnt += .1 * len(ele)
            rel.append( [doc, cnt] )
        rel.sort(key=lambda x: x[1], reverse=True)
        return [i for i in rel]




talefile = "AesopTales.txt"

def get_tales(talefile):
    tales = {};
    with open(talefile) as file:
        for tale in file.read().split("\n\n"):
            th = 0
            fl = ""
            for line in tale.split("\n"):
                line = line.strip(" ")
                if line != "":
                    if not th:
                        tales[line] = ""
                        fl = line
                        s = fl
                        th=1
                    else:
                        tales[fl] += line.lower()
    return tales


if __name__ == "__main__":
    tales = get_tales(talefile)
    doc = Documents(tales)
    print(len(tales))
    
    pprint({"relavance":doc.matcher("hired")}, indent=2)
    print("\n\n\n")
    pprint(doc.oia("hired"), indent=6)
    print("\n\n\n")
    pprint(doc.aia("hired"), indent=2)
    print("\n\n\n")
    
    
