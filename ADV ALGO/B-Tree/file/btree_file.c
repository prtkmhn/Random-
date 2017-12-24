#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <string.h>
#include "btree_file.h"
#define SIZE 5
#define ALLOC(x) (x*)malloc(sizeof(x))

//creates a new record, given values of key , country , status , x , y
//returns the created record
record *fill_record(int key , char *country , char *status , int x , int y){
	record *A = (record *)malloc(sizeof(record)); 
	A->key = key;
	A->country = (char *)malloc(SIZE*sizeof(char));
	A->status = (char *)malloc(SIZE*sizeof(char));	
	A->country = country;
	A->status = status;
	A->x = x;
	A->y = y;
	return A;
}

//initializes a variable of type btree.
btree* create_tree(char* fname)
{
	btree *p;
	p = ALLOC(btree); 
	strcpy(p->fname, "fname");	
	p->fp = fopen(fname, "w+");
	p->root_index = 0;
	p->index = 0;
	p->num = 0;
	return p;
}

//initialize a node in the btree.
void b_node_init(b_node *B){
	B->index = 0;
	B->leaf = 1;
	B->tree_index = -1;
	for(int i = 0 ; i < MAX + 1 ; i++){
		B->children[i] = -1;
	}
}

//Writes a node to the file, with the given offset. 
//The offset is multiplied by the size of the node to get the actual position.
void write_file(btree* ptr_tree, b_node* p, int pos)
{
	if(pos == -1)
	{
		pos = ptr_tree->index++;
	}
	fseek(ptr_tree->fp, pos * sizeof(b_node), 0);
	fwrite(p, sizeof(b_node), 1, ptr_tree->fp);	
}

//Given a position in the file, reads a node from it.
void read_file(btree* ptr_tree, b_node* p, int pos)
{
	fseek(ptr_tree->fp, pos * sizeof(b_node), 0);
	fread(p, sizeof(b_node), 1, ptr_tree->fp);
}

//prints the keys and children of the passed node.
void disp_node(b_node* p)
{
	printf("keys\n");
	for(int i = 0; i < p->index; i++)
	{
		printf("%d ", p->node[i].key);
	}
	printf("\n");
	printf("links\n");
	for(int i = 0; i <= p->index ; i++)
	{
		printf("%d ", p->children[i]);
	}
	printf("\n");
}

//prints the subtree rooted at index.
void print_tree(btree *A , int index){
	b_node a;
	read_file(A , &a , index);
	disp_node(&a);
	if(!a.leaf){
		for(int i = 0 ; i < a.index ; i++){
			print_tree(A , a.children[i]);
		}
	}
}

//prints the information pertaining to a particular record.
void print_record(record *a){
	if(a != NULL){
		printf("\n**key: %d country: %s status : %s x : %d y : %d**\n", a->key , a->country , a->status , a->x , a->y);
	}
	else{
		printf("\nrecord not found!\n");
	}
}

//recursive search for a particular key in the tree.
//If the key is not found in the current node, a recursive call is made
//to search for the key in the corresponding child. 
record *btree_search(btree A , b_node *bnode , int key){
	int i = 0;
	int n = bnode->index;
	if(bnode == NULL){
		return NULL;
	}
	while(i < n && key > bnode->node[i].key){
		i += 1;
	}
	if(i < n && key == bnode->node[i].key){
		return &bnode->node[i];
	}
	else{
		if(!bnode->leaf){
			b_node temp;
			read_file(&A , &temp , bnode->children[i]);
			return btree_search(A , &temp , key);
		}
		else{
			return NULL;
		}
	}	
}


//A wrapper function for btree_search. Reads the root node from the file,
//and calls btree_search with root node as the current node.
void search(btree A , int key){
	b_node root;
	read_file(&A , &root , A.root_index);
	record *a = btree_search(A , &root , key);
	print_record(a);		
}

//Splits a node with MAX number of keys.
void btree_split(btree *A , b_node *x , int i){
	b_node t1;
	b_node t2;
	b_node *z = &t1;
	read_file(A , &t2 , x->children[i]); 
	b_node *y = &t2;
	z->leaf = y->leaf;
	z->index = MIN;

	for(int j = 0 ; j < MIN ; j++){
		z->node[j] = y->node[j + MIN + 1];
	}
	if(!y->leaf){
		for(int j = 0 ; j <= MIN ; j++){
			z->children[j] = y->children[j + MIN + 1];
		}
	}
	for(int j = x->index ; j > i ; j--){
		x->node[j] = x->node[j-1];
	}
	for(int j = x->index + 1 ; j > i ; j--){
		x->children[j] = x->children[j-1];
	}

	x->node[i] = y->node[MIN];
	x->index += 1;
	y->index = MIN;
	x->children[i+1] = A->index;
	x->leaf = 0;
	y->tree_index = x->children[i];
	z->tree_index = x->children[i+1];
	write_file(A , x , x->tree_index - 1);
	write_file(A , y , x->children[i] - 1);
	write_file(A , z , x->children[i+1] - 1);	
}

//inserts record new_key into the current node x. x is a non full node.
void btree_insert_nonfull(btree *A , b_node *x , record new_key){
	int i = x->index - 1;
	if(x->leaf){
		while(i>=0 && new_key.key < x->node[i].key){
			x->node[i+1] = x->node[i];
			i -= 1;
		}
		x->node[i+1] = new_key;
		x->index += 1; 
		write_file(A, x, x->tree_index);
	}
	else{
		while(i>=0 && new_key.key < x->node[i].key){
			i -= 1;
		}
		i += 1;
		b_node temp;
		read_file(A, &temp, x->children[i]);
		if(temp.index == MAX){
			btree_split(A , x , i);
			if(new_key.key > x->node[i].key){
				i += 1;
			}
		}
		b_node temp2;
		read_file(A , &temp2 , x->children[i]);
		btree_insert_nonfull(A , &temp2 , new_key);
	}
}

//checks if current node is full, and if it is, splits it.
//Else it calls btree_insert_nonfull with the current node. 
void btree_insert(btree *A , record new_key){
	b_node temp;
	read_file(A, &temp, A->root_index);
	b_node *root = &temp;

	if(root->index == MAX){
		b_node *s;
		b_node_init(s);
		s->children[0] = A->root_index;
		A->root_index = A->index;
		s->tree_index = A->index;
		write_file(A, s, s->tree_index); 		
		btree_split(A, s, 0);
		btree_insert_nonfull(A , s , new_key);
	}
	else{
		btree_insert_nonfull(A , root , new_key);
	}
}

//wrapper function for inserting into the btree.
//checks if the tree is empty, and if it is, inserts the root node.
//Else it calls btree_insert with the root node. 
void insert(btree *A , int key , char * country , char * status , int x , int y){
	record *new_rec = fill_record(key , country , status , x , y);

	if(A->num == 0){
		b_node *new_bnode = (b_node *)malloc(sizeof(b_node));
		b_node_init(new_bnode);
		new_bnode->node[0] = *new_rec;
		new_bnode->index += 1;
		new_bnode->tree_index = A->index;
		write_file(A, new_bnode,  -1); 
		A->root_index = 0;
		A->index = 1;
	}
	else{
		btree_insert(A , *new_rec);
	}
	A->num += 1;
}

