#!/usr/bin/python

# thumbtack program challenge #3: request matcher
# Henri Bai
# Uses Ford-Fulkerson Algorithm defined in http://en.wikipedia.org/wiki/Ford%E2%80%93Fulkerson_algorithm
# This problem is solved using Network Flows, you can read more about it in the link above
# The idea is we represent each request and service as a node in the graph. Each service has 20 nodes connected to it with an edge of capacity 1 that represents the days
# this service can be done. If one of the edges has flow 1, that means this service will be servicing that request represented by that day.
# Each service will be connected to a single sink node, with infinite capacity
# Each request will have an edge connected to each of the service's day node if and only if that request can be serviced on that day, and the service has the skills to tend to that service. Each edge capacity is 1
# Each request will be connected to a source node with capacity 1
# Then, we find the maximum flow from source to sink. This will give the maximal number of requests that can be serviced.
# Note: this can be extended if each requests require multiple services, but that's for another day :)

import sys
global MAX_DAYS
MAX_DAYS = 20

# edge object represents an edge in a graph with a capacity
class Edge(object):
	def __init__(self, u, v, w):
		self.capacity = w
		self.u = u
		self.v = v

# flow network represents a graph and its flow network properties
class FlowNetwork(object):
	def __init__(self):
		# dictionary of outgoing edges given a vertex
		self._outGoingEdges = {}
		
		# flow going through an edge
		self._flow = {}
	def _getEdges(self, v):
		return self._outGoingEdges[v]
	def _addVertex(self, vertex):
		# creates and adjecency list for this vertex
		if (vertex not in self._outGoingEdges):
			self._outGoingEdges[vertex] = []
	def _findPath(self, source, sink, path):
		# finds a path from source to sink using recursive depth first search. also saves the residual Cf for each edge in the path
		if source == sink:
			return path
			
		# for each edge going out of source...
		for edge in self._getEdges(source):
			# find Cf, the residual
			residual = edge.capacity - self._flow[edge]
			
			# if the flow is saturated, and this edge doesn't already exist in the path...
			if residual > 0 and (edge, residual) not in path:
				# find a path from the source's endpoint to the destination, and record the path info
				result = self._findPath( edge.v, sink, path + [(edge,residual)] ) 
				
				# if we didn't hit a dead end, return the path
				if result != None:
					return result
					
		# we hit a dead end
		return None;
	def addEdge(self, u, v, w=0):
		# add the vertexes
		self._addVertex(u);
		self._addVertex(v);
		
		# create an edge object, and create a reverse edge object
		edge = Edge(u,v,w)
		redge = Edge(v,u,0)
		
		# assign the counterpart for Gf
		edge.redge = redge
		redge.redge = edge
		
		# add the edge to the adjecency list
		self._outGoingEdges[u].append(edge)
		self._outGoingEdges[v].append(redge)
		
		# set the flow initially to 0
		self._flow[edge] = 0
		self._flow[redge] = 0
	def maxFlow(self, source, sink):
		# finds a residual path from source to sink
		path = self._findPath(source, sink, [])
		
		# while there is a residual path from source to sink...
		while path != None:
			# find the minimum residual flow in the path
			flow = min([residual for edge, residual in path])
			
			# for each edge in the path...
			for edge, res in path:
				# send flow along the path
				self._flow[edge] += flow
				
				# flow might be "returned" later
				self._flow[edge.redge] -= flow
				
			# update the path
			path = self._findPath(source, sink, [])
			
		# flow at destination is the sum of the flow being sent from the source
		return sum([self._flow[edge] for edge in self._getEdges(source)])
		
if __name__ == "__main__":
	line = sys.stdin.readline().strip()
	problemset = []
	while line != 'END':
		if (line == ''):
			g = FlowNetwork()
			
			# solve the problem set. prefix vertex names to avoid users from accidentally typing in same names as internal vertecies
			for type, name, cat, days in problemset:
				if type == 'service':
					# add an edge from the service to a sink node
					g.addEdge('service' + name, 'sink', 999)
					
					# for each available day (up to 20), create an edge from each day to the user, with flow capacity 1
					for i in xrange(0, MAX_DAYS):
						g.addEdge(str(i) + 'service' + name, 'service' + name, 1)
					
					# for each request, build an edge from the service to each day for the service
					for otherType, otherName, otherCat, otherDays in problemset:
						# if the service has the skills needed for this request
						if otherType == 'request' and not cat.isdisjoint(otherCat):
							# add an edge for day that the request can be serviced
							for i in otherDays:
								g.addEdge('request' + otherName, str(i) + 'service' + name, 1)
				elif type == 'request':
					# create an edge from a source node to all the requests
					g.addEdge('source', 'request' + name, 1);
					
			# finding max flow in the graph will give you the maximum number of services that can be accomplished
			print g.maxFlow('source', 'sink')
			
			# clear the problem set for the next batch
			problemset = []
		else:
			# add each service or request into the problem set
			args = line.split(' ')
			type = args[0]
			name = args[1]
			if (type == 'request'):
				days = range(*map(int, args[-1].split('-')))
				categories = frozenset(args[2:len(args)-1])
			else:
				days = None
				categories = frozenset(args[2:])
			problemset.append( (type, name, categories, days) )
		line = sys.stdin.readline().strip()