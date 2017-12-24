#ifndef BTREE_H
#define BTREE_H
#include <stdio.h>
#include <stdlib.h>
#include "record.h"

#define t 3
#define MAX 2*t-1
#define MIN t-1
#define NUM 100

//structure of a node in the tree. It consists of an array for keys,
//and an array for children
typedef struct b_node{
	record node[MAX];
	int children[MAX + 1];
	int index;
	int leaf;
}b_node;

//the structure of the tree. It consists of an array that holds the nodes.
typedef struct btree{
	int num;
	int root_index;
	b_node *tree;
	int size;
	int index;
}btree;

void init(btree *A);
void print(btree A , b_node root);
void search(btree A, int key);
void insert(btree *A , int key , char * country , char * status , int x , int y);
void delete(btree *A , int key);

#endif