#include <stdio.h>
#include <stdlib.h>
#include "btree_file.h"

int main()
{
	btree *A;
	A = create_tree("mytree.txt");

	insert(A , 1 , "IND" , "FAIL" , 30 , 10);
	insert(A , 2 , "IND" , "FAIL" , 30 , 10);
	insert(A , 3 , "IND" , "FAIL" , 30 , 10);
	insert(A , 4 , "IND" , "FAIL" , 30 , 10);
	insert(A , 5 , "IND" , "FAIL" , 30 , 10);
	insert(A , 6 , "IND" , "FAIL" , 30 , 10);

	search(*A , 2);
	search(*A , 1);
	return 1;
}
