// write a program to take array of 7 integers representing day numbers and print their corresponding day names.

#include <iostream>
using namespace std;

int main() {
  // if not initialized, it contains garbage values
  int days[7];

  for (int i = 0; i < 7; i++) {
    cin >> days[i];
    cout << days[i] << endl;
  }

  for (int i = 0; i < 7; i++) {
    switch (days[i]) {
      case 1:
        cout << "Sunday" << endl;
        break;
      case 2:
        cout << "Monday" << endl;
        break;
      case 3:
        cout << "Tuesday" << endl;
        break;
      case 4:
        cout << "Wednesday" << endl;
        break;
      case 5:
        cout << "Thursday" << endl;
        break;
      case 6:
        cout << "Friday" << endl;
        break;
      case 7:
        cout << "Saturday" << endl;
        break;
      default:
        cout << "Invalid day number" << endl;
        break;
    }
  }

  return 0;
}