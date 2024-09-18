#!/usr/bin/env python3

import rospy
import actionlib
import time
from move_base_msgs.msg import MoveBaseAction, MoveBaseGoal
from std_msgs.msg import String
from std_msgs.msg import Int16;
import threading
from actionlib_msgs.msg import GoalID


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
    global navclient, isInterrupted
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
    # finished = navclient.wait_for_result(rospy.Duration(secs=60))

    start_time = rospy.Time.now()
    timeout = rospy.Duration(secs=60)  # 60 seconds timeout

    while not rospy.is_shutdown():
        # Check if interrupted
        if isInterrupted:
            rospy.loginfo("Navigation interrupted!")
            navclient.cancel_all_goals()  # Cancel all goals
            return False
        
        # Check if the goal is finished
        # if navclient.wait_for_result(rospy.Duration(secs=1)):  # Check every second
        #     rospy.loginfo(navclient.get_result())
        #     return True

        state = navclient.get_state()
        if state == 3:
            rospy.loginfo(navclient.get_result())
            return True
        elif state > 3:
            rospy.logerr(state)

        # Check for timeout
        if rospy.Time.now() - start_time > timeout:
            rospy.logwarn("Navigation timed out!")
            navclient.cancel_all_goals()
            return False

    # if not finished:
    #     rospy.logerr("Action server not available!")
    #     return False
    # else:
    #     rospy.loginfo ( navclient.get_result())
    #     return True
    
def callThread(data):
    global t1, isInterrupted

    trimData = data.data.split(';')

    if (int(trimData[0]) == -1):
        print('Should interrupt!!!!')
        isInterrupted = True

        try:
            t1.join()
        except:
            print('no thread is running')
        return
    
    try:
        t1.join()
    except:
        print('no thread is running')
    finally:
        isInterrupted = False
        t1 = threading.Thread(target=doTaskCallback, args=(data,))
        t1.start()

def doTaskCallback(data):
    taskId = -1
    try:
        global isBusy
        global stage
        global startTime
        global endTime
        trimData = data.data.split(';')

        # if (int(trimData[0]) == -1):
        #     print('Should interrupt!!!!')
        #     global navclient
        #     navclient.cancel_all_goals()
        #     return

        if (isBusy == 1):
            print('robot is busy doing another task!!')
            return
        
        timeStamp = int(trimData[0])
        taskStage = int(trimData[3])
        taskId = int(trimData[4])

        print(timeStamp)
        print('start', startTime)
        print('end', endTime)

        

        if (startTime != 0 and (timeStamp >= startTime and timeStamp <= endTime)):
            return
        
        startTime = timeStamp
        isBusy = 1
        stage = 1

        position_good = {"x": float(trimData[1]), "y" : float(trimData[2]), "z": 0.0}
        orientation_good = {"x": 0.0, "y":  0.0, "z":  0.0, "w": 0.1}

        
        rospy.loginfo('received task!')
        pub.publish(f'{taskStage};{taskId}')
        
        #define callbacks
        def timeoutResolve():
            global isBusy
            global endTime
            isBusy = 0
            endTime = round(time.time() * 1000)
            print('TIMEOUT! or FAILURE!')
            pub.publish(f'{-3};{taskId}')
            #-3 means timeout

        def done_nav_deliver_cb(status, result):
            if status == 3:
                rospy.loginfo("the goal is reached!")
                global stage
                global endTime
                stage = 2
                endTime = round(time.time() * 1000)
                pub.publish(f'{taskStage+1};{taskId}')

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
        pub.publish(f'{-2};{taskId}') #???? maybe an error here?
        return


pub = rospy.Publisher('taskReport', String, queue_size=10)
navclient = actionlib.SimpleActionClient('/tb3_2/move_base',MoveBaseAction)
cancel_pub = rospy.Publisher("tb3_2/move_base/cancel", GoalID, queue_size=1)
cancel_msg = GoalID()
isInterrupted = False
t1 = None

if __name__ == "__main__":
    isBusy = 0
    stage = 0
    startTime = 0
    endTime = 0

    rospy.init_node('tb3_0_navigator')

    rospy.Subscriber("taskAssign", String, callThread)

    print('tb3_0_navigator is listening!')
    
    rospy.spin()
    
