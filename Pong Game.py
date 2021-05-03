#####################引用数据库与函数#####################
from random import random,choice
from turtle import *
#########################定义变量#########################
player=[0,-140]
ball=[0,140]
direction=[choice([-2,-1,1,2]),choice([-2,-1])]
#########################定义函数#########################
def move(aim):
    player[0] += aim

def bounce():
    if ball[0]<=-300 or ball[0]>=290: 
        direction[0]=-direction[0] 
    elif ball[1]>=150: 
        direction[1]=-direction[1] 
    elif ball[1]<=-140+10+5 and player[0]<=ball[0]<=player[0]+70:
        direction[1]=-direction[1] 

def outside():
    if ball[1]<=-140 :return True

def rectangle(x,y,width,height):
    up()
    goto(x,y)
    begin_fill()
    for n in range(2):
        forward(width)
        left(90)
        forward(height)
        left(90)
    end_fill()

def draw():
    clear()
    up()
    goto(ball[0],ball[1])
    dot(10,"red")
    rectangle(player[0],player[1],70,10)
    update()

def gameLoop():
    bounce()
    ball[0] += direction[0]*3.5  # ball[0] = ball[0] + direction[0]*2
    ball[1] += direction[1]*3.5
    draw()
    if outside():
        return 
    ontimer(gameLoop,50)
##########################主程序##########################
setup(620,320,0,0)
hideturtle()
tracer(False)
listen()
onkey(lambda:move(30),'d')
onkey(lambda:move(-30),'a')
gameLoop()
done()