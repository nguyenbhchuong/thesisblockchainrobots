#!/usr/bin/env python3

import rospy
import actionlib
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
    navclient = actionlib.SimpleActionClient('tb3_2/move_base',MoveBaseAction)
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

    if (isBusy == 1):
        print('robot is busy doing another task!!')
        return
    isBusy = 1
    while not rospy.is_shutdown():
        position_good = {"x": -2.16, "y" : 2.0, "z": 0.0}
        orientation_good = {"x": 0.0, "y":  0.0, "z":  0.0, "w": 0.1}

        position_deliver = {"x": 3, "y" : 2.0, "z": 0.0}
        orientation_deliver = {"x": 0.0, "y":  0.0, "z":  0.0, "w": 0.1}

        #define callbacks
        def done_nav_good_cb(status, result):
            if status == 3:
                rospy.loginfo("Goal reached")
                global good 
                global stage
                good = 1
                stage = 1
                pub.publish(stage)

        def done_nav_deliver_cb(status, result):
            if status == 3:
                rospy.loginfo("Goal reached")
                global good 
                global stage
                good = 0
                stage = 2
                pub.publish(stage)

        if (stage == 0):
            navigate(position_good, orientation_good, done_nav_good_cb)
            #add update block
        elif (stage == 1):
            print('check good', good)
            navigate(position_deliver, orientation_deliver, done_nav_deliver_cb)
            #add update block
        elif (stage == 2):
            #add success block
            print('final good', good)
            isBusy = 0
            stage = 0
            break

pub = rospy.Publisher('taskReport', Int16, queue_size=10)

if __name__ == "__main__":
    isBusy = 0
    good = 0
    stage = 0

    rospy.init_node('tb3_2_movement')

    rospy.Subscriber("taskAssign", String, doTaskCallback)
    
    rospy.spin()
    
