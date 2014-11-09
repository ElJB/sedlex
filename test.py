# -*- coding: latin-1 -*-

import re

a = re.compile(".+utile", flags=re.I)
b = a.match("Avec ce projet de loi, nous effectuons un premier pas utile et important vers une plus grande transparence, \
	réclamée à cor et à cri depuis des années par les ONG et les forces progressistes.")
print b.group(0)