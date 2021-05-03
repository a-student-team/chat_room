from turtle import *
from random import randrange
from time import sleep

bird=[-100,80]
ball=[[240,0]]
bird_size=50
ball_size=80

def change():
    bird[1]=bird[1]+bird_size

def draw():
    clear()
    for n in range(len(ball)):
        up()
        goto(ball[n][0],ball[n][1])
        dot(ball_size,"dark green")
        ball[n][0]=ball[n][0]-3
    up()
    goto(bird[0],bird[1])
    dot(bird_size,"yellow")
    bird[1]=bird[1]-5
    update()

def inside():
    if bird[1]<-310+bird_size/2 or bird[1]>310-bird_size/2 :
        return False 
    else :
        return True

def distance(a,b,x,y):
    return ((a-x) ** 2 + (b-y) ** 2) ** 0.5

def hit():
    for n in range(len(ball)):
        if distance(ball[n][0],ball[n][1],bird[0],bird[1])<(ball_size+bird_size)/2-5:
            return True

    return False

def gameLoop():
    global bird,ball
    if randrange(30) == 1:
        x=240
        y=randrange(-310,310)
        ball.append([x,y])
    if len(ball)!=0 and ball[0][0]<-240:
        ball.pop(0)
    draw()
    if not inside() or hit():
        sleep(2)
        ball.clear()
        bird.clear()
        bird=[-100,80]
        ball=[[240,0]]
    ontimer(gameLoop,30)

setup(420,620,0,0)
hideturtle()
tracer(False)
bgcolor("light blue")
listen()
onkey(lambda: change()," ")
gameLoop()
done()