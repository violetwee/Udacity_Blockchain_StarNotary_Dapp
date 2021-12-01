const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
  accounts = accs;
  owner = accounts[0];
});

it('can create a star', async () => {
  let tokenId = 1;
  let instance = await StarNotary.deployed();
  await instance.createStar('Awesome Star!', tokenId, { from: accounts[0] })
  assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let starId = 2;
  let starPrice = web3.utils.toWei(".01", "ether");
  await instance.createStar('awesome star', starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 3;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar('awesome star', starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
  await instance.buyStar(starId, { from: user2, value: balance });
  let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
  let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
  let value2 = Number(balanceOfUser1AfterTransaction);
  assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 4;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar('awesome star', starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, { from: user2, value: balance });
  assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 5;

  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar('awesome star', starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
  const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, { from: user2, value: balance, gasPrice: 0 });
  const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
  let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
  assert.equal(value, starPrice);
});

// Task 2: The token name and token symbol are added properly.
it('can add the star name and star symbol properly', async () => {
  let instance = await StarNotary.deployed();
  let starId = 6;
  let user = accounts[1];

  await instance.createStar('My star 6', starId, { from: user });
  assert.equal(await instance.name.call(), 'StarNotary');
  assert.equal(await instance.symbol.call(), 'STAR');
})

// Task 2: 2 users can exchange their stars.
it('lets 2 users exchange stars', async () => {
  let instance = await StarNotary.deployed();
  let starId1 = 7;
  let starId2 = 8;
  let user1 = accounts[1];
  let user2 = accounts[2];

  // user1 creates a star
  await instance.createStar('My star 7', starId1, { from: user1 });
  // user 2 creates a star
  await instance.createStar('My star 8', starId2, { from: user2 });
  // exchange stars
  await instance.exchangeStars(starId1, starId2, { from: user1 });

  // verify that user1 has starId2 and user2 has starId1
  let ownerOfStar1 = await instance.ownerOf(starId1);
  let ownerOfStar2 = await instance.ownerOf(starId2);
  assert.equal(ownerOfStar1, user2);
  assert.equal(ownerOfStar2, user1);
})

// Task 2: Stars Tokens can be transferred from one address to another.
it('lets a user transfer a star', async () => {
  let instance = await StarNotary.deployed();
  let starId = 9;
  let user1 = accounts[1];
  let user2 = accounts[2];

  // user1 creates a star
  await instance.createStar('My star 7', starId, { from: user1 });
  // user1 transfers star to user2
  await instance.transferStar(user2, starId, { from: user1 });
  // verify that user2 now owns the star
  let newOwnerOfStar = await instance.ownerOf(starId);
  assert.equal(newOwnerOfStar, user2);
})