# print Hello, Om
print('Hello, Om')

# program to declare variables
number = 4
print(number)

decimal = 4.4
print(decimal)

string = 'Hello, Om'
print(string)

# program to illustrate a list
nums = []
nums.append(21)
nums.append(40.78)
nums.append('Om')
print(nums)

# program to illustrate a Dictionary
Dict = []
Dict = {1: 'Geeks', 2: 'For', 3: 'Geeks'} 
print(Dict)


# program to illustrate a tuple
tup = ('Geeks', 'For', 'Geeks')
print(tup)


# program to illustrate a set as set doesn't have duplicate elements so, 1 geeks will not be printed
myset = set(["Geeks", "For", "Geeks"]) 
print(myset)


# program to illustrate getting input from user
name = input("Enter your name: ") 
print("hello", name)

# program to get input from user accepting integer from the user the return type of input() function is string , so we need to convert the input to integer
num1 = int(input("Enter num1: "))
num2 = int(input("Enter num2: "))
num3 = num1 * num2
print("Product is: ", num3)


# program to illustrate selection statement
num1 = 34
if(num1>12):
    print("Num1 is good")
elif(num1>35):
    print("Num2 is not gooooo....")
else:
    print("Num2 is great")


# Python program to illustrate functions
def hello():
    print("hello")
    print("hello again")
hello()


# program to illustrate fuction with main 
def getInteger():
    result = int(input('Enter integer: '))
    return result
def Main():
    print('Started')
    output = getInteger()
    print(output)
if __name__ == "__main__":
    Main()
    

# Python program to illustrate a simple for loop
for step in range(5):    
    print(step)


# Python program to illustrate a simple while loop
step = 0
while(step < 5):
    print(step)
    step = step+1