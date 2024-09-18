#!/usr/bin/env python3

import rospy
import actionlib
import time
from move_base_msgs.msg import MoveBaseAction, MoveBaseGoal
from std_msgs.msg import String
from std_msgs.msg import Int16;
import threading


# Callbacks definition

def active_cb(extra='default'):
    rospy.loginfo("Goal pose being processed")

def feedback_cb(feedback):
    rospy.loginfo("Current location: ")
    # +str(feedback))

# def done_cb(status, result):
#     if status == 3:
#         rospy.loginfo("Goal reached")
#     if status == 2 or status == 8:
#         rospy.loginfo("Goal cancelled")
#     if status == 4:
#         rospy.loginfo("Goal aborted")
    


def navigate(position, orientation, done_cb):
    # navclient = actionlib.SimpleActionClient('move_base',MoveBaseAction)
    global navclient

    navclient.wait_for_server()

    # Example of navigation goal
    goal = MoveBaseGoal()
    goal.target_pose.header.frame_id = "map"
    goal.target_pose.header.stamp = rospy.Time.now()

    goal.target_pose.pose.position.x = position['x']
    goal.target_pose.pose.position.y = position['y']
    goal.target_pose.pose.position.z = position['z']
    goal.target_pose.pose.orientation.x = orientation['x']
    goal.target_pose.pose.orientation.y = orientation['y']
    goal.target_pose.pose.orientation.z = orientation['z']
    goal.target_pose.pose.orientation.w = orientation['w']

    navclient.send_goal(goal, done_cb, active_cb, feedback_cb)
    finished = navclient.wait_for_result(rospy.Duration(secs=20))

    if not finished:
        rospy.logerr("Action server not available!")
        return False
    else:
        rospy.loginfo ( navclient.get_result())
        return True
    
def callThread(data):
    global t1
    try:
        t1.join()
    except:
        print('no thread is running')
    finally:
        t1 = threading.Thread(doTaskCallback, args=(data,))
        t1.start()

def doTaskCallback(data):
    try:
        global isBusy
        global stage
        global startTime
        global endTime
        trimData = data.data.split(';')

        if (isBusy == 1):
            print('robot is busy doing another task!!')
            return
        
        timeStamp = int(trimData[0])
        taskStage = int(trimData[3])
        print(timeStamp)
        print('start', startTime)
        print('end', endTime)

        if (timeStamp == -1):
            global navclient
            navclient.cancel_all_goals()
            return

        if (startTime != 0 and (timeStamp >= startTime and timeStamp <= endTime)):
            return
        
        startTime = timeStamp
        isBusy = 1
        stage = 1

        position_good = {"x": float(trimData[1]), "y" : float(trimData[2]), "z": 0.0}
        orientation_good = {"x": 0.0, "y":  0.0, "z":  0.0, "w": 0.1}

        
        rospy.loginfo('received task!')
        pub.publish(0)
        
        #define callbacks
        def timeoutResolve():
            global isBusy
            global endTime
            isBusy = 0
            endTime = round(time.time() * 1000)
            print('TIMEOUT! or FAILURE!')
            pub.publish(-3)
            #-3 means timeout

        def done_nav_deliver_cb(status, result):
            if status == 3:
                rospy.loginfo("the goal is reached!")
                global stage
                global endTime
                stage = 2
                endTime = round(time.time() * 1000)
                pub.publish(taskStage)

        while not rospy.is_shutdown():
                
            if (stage == 1):
                result1 = navigate(position_good, orientation_good, done_nav_deliver_cb)
                if not result1:
                    timeoutResolve()
                    break
            elif (stage == 2):
                #add success block
                print('finished')
                isBusy = 0
                stage = 0
                break
            
    except BaseException as err:
        print('navigator error in do task callback - should rebound',err)
        isBusy = 0
        endTime = round(time.time() * 1000)
        pub.publish(-2)
        return


pub = rospy.Publisher('taskReport', Int16, queue_size=10)
navclient = actionlib.SimpleActionClient('tb3_2/move_base',MoveBaseAction)
t1 = None

if __name__ == "__main__":
    isBusy = 0
    stage = 0
    startTime = 0
    endTime = 0

    rospy.init_node('tb3_2_movement')

    rospy.Subscriber("taskAssign", String, doTaskCallback)

    print('tb3_2_movement is listening!')
    
    rospy.spin()
    
