# -*- coding: latin1 -*-

import psycopg2
from operator import itemgetter
import re, os

conn = psycopg2.connect("dbname=boniface user=boniface password=blabla")

cur = conn.cursor()

cur.execute("SELECT lemma_sentence FROM corpus WHERE lemma_sentence IS NOT NULL")

rows = cur.fetchall()

sentences = [row[0] for row in rows]
del rows

# stopWords = ["plus"]
# for word in stopWords:
# 	sentences = map(lambda x: x.replace(" " + word + " ", " "), sentences)


def gen_templates(seed):
	result = map(lambda x: re.compile(".+\s" + x + "\set\s([^\s,\.!?;]+)", flags=re.I), seed)
	result.extend(map(lambda x: re.compile(".+\s([^\s,\.!?;]+)\set\s" + x + "[\s,\.!?;]", flags=re.I), seed))
	# result.extend(map(lambda x: re.compile(".+\s" + x + "\s,\s([^\s,\.!?;]+)", flags=re.I), seed))
	# result.extend(map(lambda x: re.compile(".+\s([^\s,\.!?;]+)\s,\s" + x + "[\s,\.!?;]", flags=re.I), seed))
	return result

def next_seed(sentences, seed, lexicon):
	result = set()

	print "Start extract cyle: " + str(len(sentences)) + " sentences"
	templates = gen_templates(seed)

	print str(len(templates)) + " templates"
	for sentence in sentences:
		for template in templates:
			match = template.match(sentence)
			if match and match.group(1) not in ["_NUMBER", "_LOCATION", "NOT_ne"] and len(match.group(1)) > 4:
				result.add(match.group(1))
				print sentence

	return result.difference(lexicon)

def extract_lexicon(file_name, seed):
	try:
		os.remove(file_name)
	except OSError:
		print "OSError"

	with open(file_name, "w") as f:

		seed = set(seed)
		lexicon = seed

		for word in seed:
			f.write(str(word) + "\n")

		while len(seed):
			seed = next_seed(sentences, seed, lexicon)
			lexicon.update(seed)
			for word in seed:
				f.write(str(word) + "\n")

extract_lexicon("lexicon_positive.txt", ["utile", "nécessaire", "innovant"])
extract_lexicon("lexicon_negative.txt", ["stérile", "contreproductif", "NOT_nécessaire", "abusif", "inefficace", "faible", "insuffisant", "injuste"])
