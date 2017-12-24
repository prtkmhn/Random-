#ifndef BTREE_FILE_H
#define BTREE_FILE_H
#include <stdio.h>
#define t 3
#define MAX (2*t - 1)
#define MIN (t-1)

//the structure of the tree. It consists of a pointer to the file that stores the nodes.
typedef struct btree
{
	char fname[20];
	FILE *fp;
	int root_index;
	int index;
	int num;
}btree;

//a record structure, consisting of key and information.
typedef struct record
{
	int key;
	char *country;
	char *status;
	int x;
	int y;
}record;

//structure of a node in the tree. It consists of an array for keys,
//and an array for children
typedef struct b_node
{
	int index;
	int leaf;
	int tree_index;
	record node[2 * t - 1];
	int children[2 * t]; 
}b_node;

btree* create_tree(char*);
void insert(btree *A , int key , char * country , char * status , int x , int y);
void search(btree A , int key);
void write_file(btree* ptr_tree, b_node* p, int pos);
void read_file(btree* ptr_tree, b_node* p, int pos);
void print_tree(btree *A , int index);
void disp_node(b_node* p);
#endif
