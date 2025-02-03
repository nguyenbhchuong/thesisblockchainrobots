#!/usr/bin/env python3

import rospy
import actionlib
import time
from move_base_msgs.msg import MoveBaseAction, MoveBaseGoal
from std_msgs.msg import String
from std_msgs.msg import Int16;


def active_cb(extra='default'):
    rospy.loginfo("Goal pose being processed")

def feedback_cb(feedback):
    rospy.loginfo("Current location: ")

def navigate(position, orientation, done_cb):
    # navclient = actionlib.SimpleActionClient('move_base',MoveBaseAction)
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
    finished = navclient.wait_for_result(rospy.Duration(secs=20))

    if not finished:
        rospy.logerr("Action server not available!", navclient.get_result())
        return False
    else:
        rospy.loginfo ( navclient.get_result())
        return True

pub = rospy.Publisher('taskReport', Int16, queue_size=10)
position_home = {"x": 0, "y": 0, "z": 0}
orientation_home = {"x": 0.0, "y":  0.0, "z":  0.0, "w": 0.1}

def arrive_home(status, result):
    if status == 3:
        rospy.loginfo("home")

if __name__ == "__main__":
    rospy.init_node('tb3_2_interceptor')

    navclient = actionlib.SimpleActionClient('tb3_2/move_base',MoveBaseAction)

    navclient.wait_for_server()
    result3 = navigate(position_home, orientation_home, arrive_home)

    print(result3)
    print('done')
    rospy.spin()

    # rospy.Subscriber("taskAssign", String, doTaskCallback)