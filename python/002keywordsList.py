'''and	as	assert	break
class	continue	def	del
elif	else	except	False
finally	for	from	global
if	import	in	is
lambda	None	nonlocal	not
or	pass	raise	return
True	try	while	with
yield'''

import keyword
print("The list of keywords is : ", keyword.kwlist)

# True, False, and None Keyword
print(False == 0)
print(True == 1)
print(True + True + True)
print(True + False + False)
print(None == 0)
print(None == [])

# and, or, not, in, is
print(True or False)
print(False and True)
print(not True)
if 's' in 'geeksforgeeks':
    print("s is part of geeksforgeeks")
else:
    print("s is not part of geeksforgeeks")
for i in 'geeksforgeeks':
    print(i, end=" ")
print("\r")
print(' ' is ' ')
print({} is {})

# Iteration Keywords – for, while, break, continue
for i in range(10):
    print(i, end = " ")
    if i == 6:
        break
print()
i = 0
while i <10:
    if i == 6:
        i+= 1
        continue
    else:
        print(i, end = " ")
    i += 1

# Conditional keywords – if, else, elif
i = 20
if (i == 10):
    print ("i is 10")
elif (i == 20):
    print ("i is 20")
else:
    print ("i is not present")

# def
def fun():
    print("Inside Function")
fun()

# Return Keywords – Return, Yield
def fun():
    S = 0
    for i in range(10):
        S += i
    return S
print(fun())
def fun():
    S = 0
    for i in range(10):
        S += i
        yield S
for i in fun():
    print(i)