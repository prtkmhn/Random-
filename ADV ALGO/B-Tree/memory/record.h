#ifndef RECORD_H
#define RECORD_H
#include <stdio.h>
#include <stdlib.h>
#define SIZE 5

//a record structure, consisting of key and information.
typedef struct record{
	int key;
	char *country;
	char *status;
	int x;
	int y;
}record;

//creates a new record, given values of key , country , status , x , y
//returns the created record
record *fill_record(int key , char *country , char *status , int x , int y){
	record *A = (record *)malloc(sizeof(record)); 
	A->country = (char *)malloc(SIZE*sizeof(char));
	A->status = (char *)malloc(SIZE*sizeof(char));
	A->key = key;
	A->country = country;
	A->status = status;
	A->x = x;
	A->y = y;
	return A;
}
#endif