// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

contract TaskManager {
    
    // Declare struct
    struct Task {
        uint id;
        string good;
        string origin;
        string destination;

        uint assigner;
        uint validator;
        uint stage;

        uint timeIssued;
        uint timeStarted;
        uint timeDelivered;
    }

    struct Robot {
        address node_address;
        uint status; // 0 is free
        uint credit;
    }
    
    // Declare arrays
    Task[] public tasks;
    Robot[] public robots;
    uint public roundRobin = 0;

    // Declare events
    event DoneFindingFreeBots(uint[] freeBotsID);
    event DoneFindingNewTasks(uint[] unassignedTasksID);
    event DoneFindingValidatingTasks(uint[] validatingTasksID);
    event Check(int check);
    event CheckU(uint check);

    constructor() {
        robots.push(Robot({node_address: 0x8943545177806ED17B9F23F0a21ee5948eCaa776, status: 0, credit: 5}));
        robots.push(Robot({node_address: 0x614561D2d143621E126e87831AEF287678B442b8, status: 0, credit: 5}));
        robots.push(Robot({node_address: 0xf93Ee4Cf8c6c40b329b0c0626F28333c132CF241, status: 0, credit: 5}));
    }
    //uint timeIssued

    function addTask(string calldata good, string calldata origin, string calldata destination, uint timeIssued) external {
        Task memory task = Task(tasks.length, good, origin, destination, 0, 0, 0, timeIssued, 0, 0);
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
            if (robots[i].status == 0 && robots[i].credit > 0) {
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
            // tasks[unassignedTasks[tasksIter]].timeAssigned = block.timestamp;
            robots[freeBots[botsIter]].status = 1;
            roundRobin = freeBots[botsIter];
            botsIter++;
            tasksIter++;
        }
        //#endregion        
    }

    function updateTaskStatus(uint taskID, uint stage, uint timeStamp) external {
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
        require(tasks[taskID].stage < stage, '2: This task has passed this stage!');
        //update task stage
        if (stage > 399){
            robots[uint(robotID)].status = 0; 
            tasks[taskID].stage = stage + tasks[taskID].stage * 10;
        } else {
            tasks[taskID].stage = stage;
        }
        

        //update robot status
        if (stage == 2){
            robots[uint(robotID)].credit -= 1;
            tasks[taskID].timeStarted = timeStamp;
        }
        if (stage == 5){
            robots[uint(robotID)].status = 0;
            tasks[taskID].timeDelivered = timeStamp;
        }

        

        assign();
    }

    function compare(string memory str1, string memory str2) public pure returns (bool) {
        return keccak256(abi.encodePacked(str1)) == keccak256(abi.encodePacked(str2));
    }

    function reportGoods(string[] calldata goods, string calldata location) external {
        int robotID = -1;
        uint robotsIter = 0;
        while (robotsIter < robots.length){
            if (robots[robotsIter].node_address == msg.sender){
                robotID = int(robotsIter);
                break;
            }
            robotsIter++;
        }

        emit Check(robotID);
        require(robotID > -1, '1:No such robot!');
        require(robots[uint(robotID)].credit > 0, '10: This robot has no credit!');

        
        //find done task at the location
        uint[] memory doneTasksID = new uint[](tasks.length);
        uint taskIter = 0;
        uint doneTaskCount = 0;
        while (taskIter < tasks.length){
            if (tasks[taskIter].stage == 5 && compare(tasks[taskIter].destination, location) && tasks[taskIter].assigner != uint(robotID)){
                emit CheckU(tasks[taskIter].assigner);
                emit CheckU(uint(robotID));
                doneTasksID[doneTaskCount] = tasks[taskIter].id;
                doneTaskCount++;
            }
            taskIter++;
        }

        uint[] memory doneTasks = new uint[](doneTaskCount);
        uint t = 0;
        while (t < doneTaskCount){
            doneTasks[t] = doneTasksID[t];
            t++;
        }
        
        emit DoneFindingValidatingTasks(doneTasks);


        uint checkIter = 0;
        while (checkIter < doneTasks.length){
            // Task memory currentTask = tasks[doneTasks[checkIter]];
            // string memory checkingGood = tasks[doneTasks[checkIter]].good;

            uint goodIter = 0;
            bool isContained = false;
            while (goodIter < goods.length){
                if (compare(tasks[doneTasks[checkIter]].good, goods[goodIter])){
                    isContained = true;
                }

                goodIter++;
            }
            if (isContained){
                robots[tasks[doneTasks[checkIter]].assigner].credit += 2;
                tasks[doneTasks[checkIter]].validator = uint(robotID);
                tasks[doneTasks[checkIter]].stage = 6;
            } else {
                if (robots[tasks[doneTasks[checkIter]].assigner].credit >= 2){
                    robots[tasks[doneTasks[checkIter]].assigner].credit -= 2;
                }
                tasks[doneTasks[checkIter]].validator = uint(robotID);
                tasks[doneTasks[checkIter]].stage = 7;
            }


            checkIter++;
        }
    }

    function readTasks() public view returns (Task[] memory) {
        return tasks;
    }

    function readRobots() public view returns (Robot[] memory) {
        return robots;
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
        require(robots[uint(robotID)].status != 0, '0:The robot is free!');

        uint taskIter = 0;
        while (taskIter < tasks.length){
            if (tasks[taskIter].assigner == uint(robotID) && tasks[taskIter].stage < 4){
                return tasks[taskIter];
            }
            taskIter++;
        }

        // assign();
        require(taskIter != tasks.length, '0:The robot is free!');
        return Task(0,'n','n', 'n', 0, 0, 0, 0, 0, 0);
    }
}
