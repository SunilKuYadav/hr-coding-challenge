// write a program to print grading based on marks obtained.

// 90 - 100 A
// 80 - 89  B
// 70 - 79  C
// 60 - 69  D
// 0  - 59  F

#include <iostream>
using namespace std;

int main() {
  int marks;
  cin >> marks;

  if (marks >= 90 && marks <= 100) {
    cout << "A" << endl;
  } else if (marks >= 80 && marks <= 89) {
    cout << "B" << endl;
  } else if (marks >= 70 && marks <= 79) {
    cout << "C" << endl;
  } else if (marks >= 60 && marks <= 69) {
    cout << "D" << endl;
  } else if (marks >= 0 && marks <= 59) {
    cout << "F" << endl;
  } else {
    cout << "Invalid marks" << endl;
  }

  return 0;
}