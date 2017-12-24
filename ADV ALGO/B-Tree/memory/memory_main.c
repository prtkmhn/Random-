#include <stdio.h>
#include <stdlib.h>
#include "btree.c"

int main(){
	btree A;
	init(&A);

	insert(&A , 2 , "IND" , "FAIL" , 21 , 26);
	insert(&A , 3 , "FRN" , "DIST" , 24 , 19);
	insert(&A , 4 , "USA" , "DIST" , 15 , 16);
	insert(&A , 5 , "RSS" , "DIST" , 18 , 31);
	insert(&A , 6 , "PAK" , "FAIL" , 32 , 27);
	insert(&A , 7 , "BNG" , "DIST" , 41 , 12);
	insert(&A , 8 , "AUS" , "FAIL" , 18 , 11);
	insert(&A , 9 , "GRM" , "FAIL" , 61 , 21);


	printf("\n");
	b_node root = A.tree[A.root_index];
	print(A , root);


	search(A , 12);
	search(A , 9);
	search(A , 3);
	search(A , 2);
	search(A , 4);
	search(A , 5);
	search(A , 6);
	search(A , 7);

	delete(&A , 2 );
	printf("\n");
	root = A.tree[A.root_index];
	print(A , root);
	printf("\n");

	delete(&A , 3 );
	printf("\n");
	root = A.tree[A.root_index];
	print(A , root);
	printf("\n");

	delete(&A , 4 );
	printf("\n");
	root = A.tree[A.root_index];
	print(A , root);
	printf("\n");

	delete(&A , 7 );
	printf("\n");
	root = A.tree[A.root_index];
	print(A , root);
	printf("\n");

	delete(&A , 6 );
	printf("\n");
	root = A.tree[A.root_index];
	print(A , root);
	printf("\n");

}
