//const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const console = require("console");
const { get } = require("http");

    
describe("Mycontract", function() {
   
    let mycontract, addr1, addr2, addr3;

    async function getSignerByAddress(targetAddress) {
        // Lấy danh sách các Signers từ provider
        const signers = await ethers.getSigners();
    
        // Tìm Signer có địa chỉ khớp với targetAddress
        const signer = signers.find(async (s) => (await s.getAddress()).toLowerCase() === targetAddress.toLowerCase());
    
        if (!signer) {
            throw new Error(`Không tìm thấy tài khoản với địa chỉ: ${targetAddress}`);
        }
    
        return signer;
    }

    function isValidAddress(address) {
        return ethers.utils.isAddress(address);
    }

    async function getEdge(node) {
        const edge = await mycontract.getEdge(node);
        return edge;
    }
    
    async function add_IOU(acc1, acc2, amount) {

        
        const sender = acc1.address;
        const creditor = acc2.address;

    
        let path = await doBFS(creditor, sender, getEdge);
        let ok = true;
        if(path == null) {
            ok = false;
            path = [creditor];
        }
        await mycontract.connect(acc1).add_IOU(creditor, amount, path, ok);
    }
    
    async function doBFS(start, end, getNeighbors) {
        var queue = [[start]];
        while (queue.length > 0) {
            var cur = queue.shift();
            var lastNode = cur[cur.length-1]
            if (lastNode.toLowerCase() === end.toString().toLowerCase()) {
                return cur;
            } else {
                var neighbors = await getNeighbors(lastNode);
                for (var i = 0; i < neighbors.length; i++) {
                    queue.push(cur.concat([neighbors[i]]));
                }
            }
        }
        return null;
    }

    async function getSignerByAddress(targetAddress) {
        // Lấy danh sách các Signers từ provider
        const signers = await ethers.getSigners();
    
        // Tìm Signer có địa chỉ khớp với targetAddress
        const signer = signers.find(async (s) => (await s.getAddress()).toLowerCase() === targetAddress.toLowerCase());
    
        if (!signer) {
            throw new Error(`Không tìm thấy tài khoản với địa chỉ: ${targetAddress}`);
        }
    
        return signer;
    }

    beforeEach(async function () {
        [addr1, addr2, addr3, addr4] = await ethers.getSigners();
        mycontract = await ethers.deployContract("Splitwise");
    });

    it("Check getting sender", async function() {
        const sender = await mycontract.connect(addr1).getSender();
        expect(sender).to.equal(addr1.address);
    });

    it("Check IOU edge", async function () {
        await add_IOU(addr1, addr2, 10);
        let money = await mycontract.lookup(addr1.address, addr2.address);
        expect(money.toString()).to.equal("10");
        await add_IOU(addr2, addr3, 5);
       // await add_IOU(addr2, addr4, 2);
        let path;
        path = await getEdge(addr2.address);
        console.log(path);
        await add_IOU(addr3, addr1, 6);
        money = await mycontract.lookup(addr2.address, addr3.address);
        expect(money.toString()).to.equal("0");
        path = await getEdge(addr2.address);
        console.log(path);
        let Owe = await mycontract.getTotalOwe(addr2.address);
        console.log(111);
        const acc = await getSignerByAddress(addr1.address);
        console.log(acc);
    });
});