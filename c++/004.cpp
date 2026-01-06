// write a program to take age and print whether the person is eligible to vote or not.

// >= 18 eligible else not eligible.

#include <iostream>
using namespace std;

int main() {
  int age;
  cin >> age;

  if (age >= 18) {
    cout << "Eligible to vote" << endl;
  } else {
    cout << "Not eligible to vote" << endl;
  }
  return 0;
}