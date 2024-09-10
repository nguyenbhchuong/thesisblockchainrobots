#!/usr/bin/env python3

import rospy
import actionlib
import time
from move_base_msgs.msg import MoveBaseAction, MoveBaseGoal
from std_msgs.msg import String
from std_msgs.msg import Int16;


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
    navclient = actionlib.SimpleActionClient('move_base',MoveBaseAction)

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
    finished = navclient.wait_for_result()

    if not finished:
        rospy.logerr("Action server not available!")
        return False
    else:
        rospy.loginfo ( navclient.get_result())
        return True

def doTaskCallback(data):
    global isBusy
    global stage
    global startTime
    global endTime
    trimData = data.data.split(';')

    if (isBusy == 1):
        print('robot is busy doing another task!!')
        return
    
    timeStamp = int(trimData[0])
    print(timeStamp)
    print('start', startTime)
    print('end', endTime)

    if (startTime != 0 and (timeStamp >= startTime and timeStamp <= endTime)):
        return
    
    startTime = timeStamp
    isBusy = 1
    stage = 1

    position_home = {"x": 0, "y": -1, "z": 0}
    orientation_home = {"x": 0.0, "y":  0.0, "z":  0.0, "w": 0.1}

    position_good = {"x": float(trimData[1]), "y" : float(trimData[2]), "z": 0.0}
    orientation_good = {"x": 0.0, "y":  0.0, "z":  0.0, "w": 0.1}

    position_deliver = {"x": float(trimData[3]), "y" : float(trimData[4]), "z": 0.0}
    orientation_deliver = {"x": 0.0, "y":  0.0, "z":  0.0, "w": 0.1}

    pub.publish(stage)
    
    
    while not rospy.is_shutdown():
        # position_good = {"x": int(trimData[1]), "y" : int(trimData[2]), "z": 0.0}
        # orientation_good = {"x": 0.0, "y":  0.0, "z":  0.0, "w": 0.1}

        # position_deliver = {"x": int(trimData[3]), "y" : int(trimData[4]), "z": 0.0}
        # orientation_deliver = {"x": 0.0, "y":  0.0, "z":  0.0, "w": 0.1}

        #define callbacks
        def done_nav_good_cb(status, result):
            if status == 3:
                rospy.loginfo("Goal reached")
                global good 
                global stage
                good = 1
                stage = 2
                pub.publish(stage)

        def done_nav_deliver_cb(status, result):
            if status == 3:
                rospy.loginfo("Goal reached")
                global good 
                global stage
                global endTime
                good = 0
                stage = 3
                endTime = round(time.time() * 1000)
                pub.publish(stage)

        def arrive_home(status, result):
            if status == 3:
                rospy.loginfo("home")

        if (stage == 1):
            navigate(position_good, orientation_good, done_nav_good_cb)
            #add update block
        elif (stage == 2):
            print('check good', good)
            navigate(position_deliver, orientation_deliver, done_nav_deliver_cb)
            #add update block
        elif (stage == 3):
            #add success block
            print('final good', good)
            navigate(position_home, orientation_home, arrive_home)
            isBusy = 0
            stage = 0
            break

pub = rospy.Publisher('taskReport_1', Int16, queue_size=10)

if __name__ == "__main__":
    isBusy = 0
    good = 0
    stage = 0
    startTime = 0
    endTime = 0

    rospy.init_node('tb3_1_movement')

    rospy.Subscriber("taskAssign_1", String, doTaskCallback)

    print('tb3_1_movement is listening!')
    
    rospy.spin()
    
