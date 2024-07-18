#!/usr/bin/env python3
import rospy
from std_msgs.msg import String

def publishCommand():
    
    pub = rospy.Publisher('taskAssign', String, queue_size=10)
    rospy.init_node('controller')
    rate = rospy.Rate(10) #10Hz
    while not rospy.is_shutdown():
        message = str(input())
        print('current message', message)
        pub.publish(message)
        rate.sleep()

if __name__ == '__main__':
    try:
        publishCommand()
    except rospy.ROSInterruptException:
        pass