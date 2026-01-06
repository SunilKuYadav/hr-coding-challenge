// write a program to print day name based on day number.

// 1 - Sunday
// 2 - Monday
// 3 - Tuesday
// 4 - Wednesday
// 5 - Thursday
// 6 - Friday
// 7 - Saturday

#include <iostream>
using namespace std;

int main() {
  int day;
  cin >> day;

  switch (day) {
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

  return 0;
}