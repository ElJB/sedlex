# -*- coding: latin1 -*-

import psycopg2
# from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
# from sklearn.lda import LDA
from sklearn.cross_validation import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer

conn = psycopg2.connect("dbname=boniface user=boniface password=blabla")

cur = conn.cursor()

cur.execute("SELECT lemma_sentence, relevance, sentiment, information FROM corpus WHERE information IS NOT NULL")

def classificationError(b, a):
	assert len(a) == len(b)
	result = {}
	for i in range(len(a)):
		key = str(a[i]) + " => " + str(b[i])
		if key not in result : result[key] = 1
		else : result[key] += 1
	return result

# stopWords = [ 'ce',
#   'un',
#   'en',
#   'de',
#   'le',
#   'son',
#   'par',
#   'à',
#   'cln',
#   'qui',
#   'lui',
#   'cld',
#   'Uw',
#   'cla',
#   'clr',
#   'uw',
#   'ion',
#   'sur',
#   'est',
#   'nom',
#   'au',
#   'du',
#   'clg',
#   'dès',
#   'cll',
#   'une',
#   'a',
#   'où?',
#   'moi',
#   'la',
#   'là' ]

class BagOfWords:

	def __init__(self, sentences):
		self.vocabulary = set()
		for sentence in sentences:
			self.vocabulary = self.vocabulary.union(tuple(sentence.split(' ')))
		# for word in stopWords:
		# 	self.vocabulary.remove(word)

		self.sentences = []
		for sentence in sentences:
			self.sentences.append(self.convert(sentence))

	def convert(self, sentence):
		result = []
		for word in self.vocabulary:
			result.append(sentence.count(word))
		return result

	def get_bow(self):
		return self.sentences


valueMap = {
	'useless': 1,
	'positive': 2,
	'negative': 3
}

rows = cur.fetchall()
sentences = [row[0] for row in rows]
information = [row[3] for row in rows]
del rows



# bow = BagOfWords(sentences)
vectorizer = TfidfVectorizer()
classifier = RandomForestClassifier()

data_train, data_test, result_train, result_test = train_test_split(sentences, information)
data_train = vectorizer.fit_transform(data_train)
data_test = vectorizer.transform(data_test)

classifier.fit(data_train.toarray(), result_train)
print classificationError(classifier.predict(data_test.toarray()), result_test)
print classifier.score(data_test.toarray(), result_test)
