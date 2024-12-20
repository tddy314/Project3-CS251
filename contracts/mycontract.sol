// SPDX-License-Identifier: UNLICENSED

// DO NOT MODIFY BELOW THIS
pragma solidity ^0.8.17;

import "hardhat/console.sol";

contract Splitwise {
    address[] private users;
    mapping(address => bool) private mark;
    mapping(address => mapping(address => uint)) private weight;
    mapping(address => uint) private totalOwe;
    mapping(address => uint) private lastActive;
    mapping(address => address[]) private edge;
    mapping(address => mapping(address => bool)) private ex;
    mapping(address => mapping(address => uint)) private pos;

    function getTotalOwe(address user) external view returns(uint32) {
        return uint32(totalOwe[user]);
    }

    function getLastActive(address user) external view returns(uint) {
        return lastActive[user];
    }
    

    function getEdge(address user) external view returns(address[] memory){
        return edge[user];
    }

    function addEgde(address u, address v) private {
        if(ex[u][v] == false) {
            ex[u][v] = true;
            edge[u].push(v);
            pos[v][u] = edge[u].length - 1;
        }
    }

    function getListofUsers() external view returns(address[] memory) {
        return users;
    }

    function addUser(address user) private {
        if(mark[user] == false) {
            mark[user] = true;
            users.push(user);
        }
    }

    function removeEdge(address u, address v) private {
        address temp = edge[u][edge[u].length - 1];
        edge[u][pos[v][u]] = temp;
        pos[temp][u] = pos[v][u];
        edge[u].pop();
        ex[u][v] = false;
    }

    function getSender() external view returns(address) {
        return msg.sender;
    }

    function setAction(address user) private {
        lastActive[user] = block.timestamp;
    }

    function lookup(address debtor, address creditor) external view returns(uint) {
        require(debtor != creditor, "You owe yourself nothing!");
        return weight[debtor][creditor];
    } 
    
    function checkEdge(address u, address v) external view returns(bool) {
        return ex[u][v];
    }

    function add_IOU(address creditor, uint amount, address[] calldata path, bool ok, address sender) public payable {
        require(sender != creditor, "You can't make an IOU to yourself");
        require(amount > 0, "The amount of money need to be positive!");
        addUser(creditor);
        addUser(sender);
        setAction(creditor);
        setAction(sender);
        totalOwe[sender] += amount;
        weight[sender][creditor] += amount;
        addEgde(sender, creditor);
        if(ok) {
            uint minWeight = weight[sender][creditor];
            for(uint8 i = 0; i < path.length - 1; i++) {
                uint edgeWeight = weight[path[i]][path[i + 1]];
                if(minWeight > edgeWeight)
                minWeight = edgeWeight;
            }
            totalOwe[sender] -= minWeight;
            weight[sender][creditor] -= minWeight;
            if(weight[sender][creditor] == 0) removeEdge(sender, creditor);
            for(uint8 i = 0; i < path.length - 1; i++) {
                totalOwe[path[i]] -= minWeight;
                weight[path[i]][path[i + 1]] -= minWeight;
                if(weight[path[i]][path[i + 1]] == 0) removeEdge(path[i], path[i + 1]);
            }
        }
    }
}
