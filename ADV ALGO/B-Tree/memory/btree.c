#include <stdio.h>
#include <stdlib.h>
#include "btree.h"
#include "record.h"
//delete int key from node x in the btree.
void btree_delete(btree *A , b_node *x , int key);

//initialize a node in the btree.
void b_node_init(b_node *B){
	B->index = 0;
	B->leaf = 1;
	for(int i = 0 ; i < MAX + 1 ; i++){
		B->children[i] = -1;
	}
}

//initializes the btree. Sets root_index to 0.
void init(btree *A){
	A->tree = (b_node *)malloc(100*(sizeof(b_node)));
	A->size = 100;
	A->index = 0;
	A->num = 0;
	A->root_index = 0;
}

//function to print a btree starting at the the root node.
void print(btree A , b_node root){
	
	for(int i = 0 ; i < root.index ; i++){
		printf("%d\t" , root.node[i].key);
	}
	
	if(!root.leaf){
		for(int i = 0 ; i <= root.index ; i++){
			print(A , A.tree[root.children[i]]);
		}
	}
}

//prints information pertaining the given record
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
record *btree_search(btree A , b_node *bnode, int key){	
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
			return btree_search(A , &(A.tree)[bnode->children[i]] , key);
		}
		else{
			return NULL;
		}
	}
}

//wrapper function for search in the btree.
void search(btree A, int key){
	record *a = btree_search(A , &(A.tree)[A.root_index], key); 
	print_record(a);
}

//Splits a node with MAX number of keys.
void btree_split(btree *A , b_node *x , int i){
	b_node *z = (b_node *)malloc(sizeof(b_node)); 
	b_node *y = &(A->tree)[x->children[i]];
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
	A->tree[A->index++] = *z;
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
	}
	else{
		while(i>=0 && new_key.key < x->node[i].key){
			i -= 1;
		}
		i += 1;
		if(((A->tree)[x->children[i]]).index == MAX){
			btree_split(A , x , i);
			if(new_key.key > x->node[i].key){
				i += 1;
			}
		}
		btree_insert_nonfull(A , &(A->tree)[x->children[i]] , new_key);
	}
}

//checks if current node is full, and if it is, splits it.
//Else it calls btree_insert_nonfull with the current node. 
void btree_insert(btree *A , record new_key){
	b_node *root = &A->tree[A->root_index];

	if(root->index == MAX){
		b_node *s = (b_node *)malloc(sizeof(b_node));
		b_node_init(s);
		s->children[0] = A->root_index;
		A->root_index = A->index;
		A->tree[A->index++] = *s;
		btree_split(A, &A->tree[A->index-1], 0);
		btree_insert_nonfull(A , &A->tree[A->index-1] , new_key);
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
		new_bnode->node[new_bnode->index] = *new_rec;
		new_bnode->index += 1;
		A->tree[0] = *new_bnode;
		A->root_index = 0;
		A->index = 1;
	}
	else{
		btree_insert(A , *new_rec);
	}
	A->num += 1;
}

//shifts a node from the right child to the root, and a node from the root
//to the left child.
void right_shift(btree *A , b_node *x , int i){
	b_node *a = &A->tree[x->children[i]];
	b_node *b = &A->tree[x->children[i+1]];	
	a->node[a->index] = x->node[i];
	x->node[i] = b->node[0];
	a->index += 1;

	for(int i = 0 ; i < b->index-1 ; i++){
		b->node[i] = b->node[i+1];
	}
	if(!a->leaf){
		a->children[t] = b->children[0];
	
		for(int i = 0 ; i < b->index ; i++){
			b->children[i] = b->children[i+1];
		}
	}
	b->index -= 1;
}

//shifts a node from the left child to the root, and a node from the root
//to the right child.
void left_shift(btree *A , b_node *x , int i){
	b_node *a = &A->tree[x->children[i]];
	b_node *b = &A->tree[x->children[i-1]];	

	for(int i = 0 ; i < a->index - 1 ; i++){
		a->node[i+1] = a->node[i];
	}
	a->node[0] = x->node[i];
	x->node[i] = b->node[b->index];
	a->index += 1;
	if(!a->leaf){
		for(int i = 0 ; i < a->index ; i++){
			a->children[i+1] = a->children[i];
		}
		a->children[0] = b->children[b->index];
	}
	b->index -= 1;
}

//merges the root node with 2 adjacent children nodes.
void merge(btree *A , b_node *x , int i){

	b_node *a = &A->tree[x->children[i]];
	b_node *b = &A->tree[x->children[i+1]];

	a->node[a->index] = x->node[i];
	a->index += 1;

	int k = a->index;
	for(int j = 0 ; j < b->index ; j++){
		a->node[k++] = b->node[j];
	}	
	k = a->index;
	if(!a->leaf){
		for(int j = 0 ; j < b->index ; j++){
			a->children[k++] = b->children[j];
		}			
	}
	a->index += b->index;

	for(int j = i ; j < x->index -1; j++){
		x->node[j] = x->node[j+1]; 
	}

	for(int j = i + 1 ; j < x->index ; j++){
		x->children[j] = x->children[j+1];
	}
	x->index -= 1;
	b->index = 0;


	if(&A->tree[A->root_index] == x){
		if(a->leaf){
			x->leaf = 1;
		}
		x = a;
		A->tree[A->root_index] = *x;
	}

	else if(x->index == 0 && a->leaf == 1){
		x = a;
	}	

}

//checks for different conditions, and calls right shift or left shift or merge
//based on the number of keys in current node, and left and right children.
void check_and_recurse(btree *A , b_node *x , int i , int key){
	if(A->tree[x->children[i]].index > MIN){
		btree_delete(A , &A->tree[x->children[i]] , key);
	}

	else if(A->tree[x->children[i]].index <= MIN){
		if(x->children[i+1] >= 0 && A->tree[x->children[i+1]].index > MIN){
			right_shift(A , x , i);
			btree_delete(A , &A->tree[x->children[i]] , key);	

		}	
		else if(x->children[i-1] >= 0 && A->tree[x->children[i-1]].index > MIN){
			left_shift(A , x , i);
			btree_delete(A , &A->tree[x->children[i]] , key);	
		}
		else{
			if(x->children[i+1] >= 0){	
				merge(A , x , i);
			}
			else{
				merge(A , x , i-1);					
			}
			btree_delete(A , x , key);	
		}
		return;
	}
}

//a function to delete a key that is present in an internal node.
//calls btree_delete recursively so that the number of keys in the internal 
//node is preserved.
void delete_internal(btree *A , b_node *x , int i , int key){
	if(A->tree[x->children[i]].index > t){
		b_node *a = &A->tree[x->children[i]];
		x->node[i] = a->node[a->index];
		btree_delete(A , a , a->node[a->index].key);
	}
	else if(A->tree[x->children[i+1]].index > t){
		b_node *a = &A->tree[x->children[i+1]];
		x->node[i] = a->node[0];
		btree_delete(A , a , a->node[0].key);
	}
	else{
		merge(A , x , i);
		btree_delete(A , x , key);
	}

}

//deletes a key from the subtree rooted at x. If x is a leaf, and 
//the key is present in it, it is deleted, else if x is an internal node
//it calls functions recursively.
void btree_delete(btree *A , b_node *x , int key){
	if(x->leaf){
		for(int i = 0 ; i < x->index ; i++){
			if(x->node[i].key == key){
				for(int j = i ; j < x->index - 1 ; j++){
					x->node[j] = x->node[j+1];
				}
				x->index -= 1;
				return;
			}
		}
		printf("\nkey not found\n");
		return;
	}

	for(int i = 0 ; i < x->index ; i++){
		if(x->node[i].key ==key){
			delete_internal(A , x , i , key);
			return;
		}
	}

	for(int i = 0 ; i < x->index ; i++){
		if(key < x->node[i].key){
			check_and_recurse(A , x , i , key);
			return;	
		}	
	}
	check_and_recurse(A , x , x->index , key);
}

//wrapper function for deleting a key from a btree.
void delete(btree *A , int key){
	b_node *x = &A->tree[A->root_index];
	btree_delete(A , x , key);
}
