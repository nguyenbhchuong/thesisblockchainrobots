// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

contract TaskManager {
    
    // Declare struct
    struct Task {
        uint id;
        string good;
        string destination;
        uint assigner;
        uint stage;
    }

    struct Robot {
        address node_address;
        uint status; // 0 is free
    }
    
    // Declare arrays
    Task[] public tasks;
    Robot[] public robots;
    uint public roundRobin = 0;

    // Declare events
    event DoneFindingFreeBots(uint[] freeBotsID);
    event DoneFindingNewTasks(uint[] unassignedTasksID);

    constructor() {
        robots.push(Robot({node_address: 0x8943545177806ED17B9F23F0a21ee5948eCaa776, status: 0}));
        robots.push(Robot({node_address: 0x614561D2d143621E126e87831AEF287678B442b8, status: 0}));
        robots.push(Robot({node_address: 0xf93Ee4Cf8c6c40b329b0c0626F28333c132CF241, status: 0}));
    }


    function addTask(string calldata good, string calldata destination) external {
        Task memory task = Task(tasks.length, good, destination, 0, 0);
        tasks.push(task);
        assign();
    }

    function assign() internal {
        //#region find FreeBots
        uint[] memory freeBotsID = new uint[](robots.length);
        uint freeBotCount = 0;
        uint i = roundRobin;

        while (true) {
            i++;
            if (i >= robots.length) {
                i = 0;
            }
            if (robots[i].status == 0) {
                freeBotsID[freeBotCount] = i;
                freeBotCount++;
            }
            if (i == roundRobin) {
                break;
            }
        }

        uint[] memory freeBots = new uint[](freeBotCount);
        for (uint k = 0; k < freeBotCount; k++) {
            freeBots[k] = freeBotsID[k];
        }
        
        emit DoneFindingFreeBots(freeBots);
        //#endregion


        //#region Find unassigned tasks
        uint[] memory unassignedTasksID = new uint[](tasks.length);
        uint unassignedTaskCount = 0;
        uint j = 0;
        
        while (j < tasks.length) {
            if (tasks[j].stage == 0) {
                unassignedTasksID[unassignedTaskCount] = j;
                unassignedTaskCount++;
            }
            j++;
        }

        uint[] memory unassignedTasks = new uint[](unassignedTaskCount);
        for (uint l = 0; l < unassignedTaskCount; l++) {
            unassignedTasks[l] = unassignedTasksID[l];
        }
        
        emit DoneFindingNewTasks(unassignedTasks);
        //#endregion

        //#region assign tasks
        uint tasksIter = 0;
        uint botsIter = 0;
        while (tasksIter < unassignedTasks.length && botsIter < freeBots.length) {
            tasks[unassignedTasks[tasksIter]].stage = 1; // Mark task as assigned
            tasks[unassignedTasks[tasksIter]].assigner = freeBots[botsIter];
            robots[freeBots[botsIter]].status = 1;
            botsIter++;
            tasksIter++;
        }
        //#endregion        
    }


    function updateTaskStatus(uint taskID, uint stage) external {
        //check robot id
        int robotID = -1;
        uint robotsIter = 0;
        while (robotsIter < robots.length){
            if (robots[robotsIter].node_address == msg.sender){
                robotID = int(robotsIter);
                break;
            }
            robotsIter++;
        }

        require(robotID != -1, '1:No such robot!');

        //check task assigner
        require(tasks[taskID].assigner == uint(robotID), '0:This robot is not doing this task!');

        //update task stage
        tasks[taskID].stage = stage;

        //update robot status
        if (stage == 5){
            robots[uint(robotID)].status = 0;
        }

        assign();
    }

    function readTasks() public view returns (Task[] memory) {
        return tasks;
    }

    function getOwnTask() public view returns (Task memory) {

        int robotID = -1;
        uint robotsIter = 0;
        while (robotsIter < robots.length){
            if (robots[robotsIter].node_address == msg.sender){
                robotID = int(robotsIter);
                break;
            }
            robotsIter++;
        }

        require(robotID != -1, '1:No such robot!');

        uint taskIter = 0;
        while (taskIter < tasks.length){
            if (tasks[taskIter].assigner == uint(robotID) && tasks[taskIter].stage != 5){
                return tasks[taskIter];
            }
            taskIter++;
        }

        // assign();
        require(taskIter != tasks.length, '0:The robot is free!');
        return Task(0,'n','n',0,0);
    }
}
