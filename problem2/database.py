#!/usr/bin/python

# thumbtack program challenge #2: simple database
# Henri Bai
#

import sys

class Database(object):
	def __init__(self):
		# represents a history of partial dictionaries that represents change from the last transaction history
		self._transactionHistory = []
		
		# our database
		self._database = {}
	def _doWrite(self, name, val):
		# write to the database, if value is None, we remove the variable from the database
		if (val != None):
			self._database[name] = val
		else:
			del self._database[name]
	def begin(self):
		# creates a new transaction history
		self._transactionHistory.insert(0, {})
	def rollback(self):
		# if we have a transaction history, read from the most recent and apply rollbacks
		if (self._transactionHistory):
			for key, val in self._transactionHistory[0].items():
				self._doWrite(key, val)
			# remove the most recent transaction history
			self._transactionHistory.pop(0)
		else:
			print "INVALID ROLLBACK"
	def commit(self):
		# our working database is the current database
		# this is where we could push changes to disk or some other database backend
		# clear the transaction history
		self._transactionHistory = []
	def set(self, name, val):
		if (self._transactionHistory):
			# update the history for items that are changed in this transaction level
			if name in self._database and name not in self._transactionHistory[0]:
				self._transactionHistory[0][name] = self._database[name]
			if name not in self._database:
				self._transactionHistory[0][name] = None
		self._doWrite(name, val)
	def get(self, name):
		# if the name is in the database, print it
		if name in self._database:
			print self._database[name]
		else:
			print 'NULL'
	def unset(self, name):
		# set this variable to value "None"
		if name in self._database:
			self.set(name, None)
			
if __name__ == "__main__":
	data = Database()
	line = sys.stdin.readline().strip()
	while line != 'END':
		args = line.split(' ')
		
		# all in the name of saving a few lines of code
		legalCmds = ['BEGIN', 'ROLLBACK', 'COMMIT', 'SET', 'GET', 'UNSET']
		if args[0] in legalCmds:
			f = getattr(Database, args[0].lower());
			f(data,*args[1:])
		else:
			print "Unknown Command " + cmd
			
		line = sys.stdin.readline().strip()