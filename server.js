const express = require('express');
const app = express();
const port = 8080;

// 1. sudo npm i mongodb
// mongodb : yeji / Q3Pr6gDr9ZWALpqu
// 2. url에 추가 => mongodb+srv://yeji:DIgjdGumIDQDLodP@cluster0.cwlwqmp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
const { MongoClient } = require('mongodb');
const url = 'mongodb+srv://yeji:DIgjdGumIDQDLodP@cluster0.cwlwqmp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(url);

app.set('view engine', 'ejs');
app.use(express.json())
app.use(express.urlencoded({extended:true}))

// const connectDB = async () => {
//   try{
//     await client.connect()
//     console.log('DB연결')
//     const db = client.db('todo')
//     await db.collection('posts').insertOne({
//       name: '설예지',
//       date: "2024-04-29"
//     })
//     console.log('DB 추가 확인');
//   }catch(error){
//     console.error(error)
//   }
// }
// connectDB()

const methodOverride = require('method-override')
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
  //   res.send('서버 개발 시작');
  //   res.sendFile(__dirname + '/index.html');
  res.render('index');
});

const getDB = async ()=>{
  await client.connect()
  return client.db('todo')
}

app.get('/list', async (req, res) => {
  try{
    const db = await getDB();

    const posts = await db.collection('posts').find().sort({_id:-1}).toArray()
    console.log(posts);
    res.render('list', {posts}); // {posts: posts}
  }catch(error){
    console.error(error)
  }
});

app.post('/add', async (req, res)=>{
  console.log('req=======', req.body);
  // const title = req.body.title
  // const dateOfGoals = req.body.dateOfGoals
  const {title, dateOfGoals, today} = req.body
  console.log(title);
  console.log(dateOfGoals);
  // 받아온 정보를 mongodb에 저장
  try{
    const db = await getDB();
    const result = await db.collection('counter').findOne({name: 'counter'})
    console.log(result.totalPost);
    await db.collection('posts').insertOne({
      _id: result.totalPost+1,
      // title: title,
      // dateOfGoals: dateOfGoals
      // 키와 밸류가 동일하므로 생략 가능하여 아래처럼 작성
      title,
      dateOfGoals,
      today
    })
    await db.collection('counter').updateOne({name: 'counter'}, {$inc: {totalPost: 1}})
    console.log('DB 추가 확인');
  }catch(error){
    console.error(error)
  }
  // res.send('post 요청 확인')
  res.redirect('/list')
})

app.get('/detail/:id', async (req, res) => {
  const id = parseInt(req.params.id)
  console.log(id);

  try{
    const db = await getDB();
    const post = await db.collection('posts').findOne({_id: id})
    res.render('detail', {post}); // {posts: posts}
  }catch(error){
    console.error(error)
  }
});

// 수정페이지
app.get('/edit/:id', async (req, res) => {
  // console.log('id 확인', req.params.id)
  const id = parseInt(req.params.id)
  console.log('id 확인', id)
  try{
    const db = await getDB()
    const post = await db.collection('posts').findOne({_id: id})
    res.render('edit', {post})
  }catch(error){
    console.log(error)
  }
})

// 수정 기능
app.post('/update', async (req, res) => {
  const {id, title, dateOfGoals, today} = req.body;
  console.log(id)
  try{
    const db = await getDB()
    await db.collection('posts').updateOne({_id: parseInt(id)}, {$set: {title, dateOfGoals, today}})
    res.redirect('/list')
  }catch(error){
    console.log(error)
  }
})

// 삭제
app.post('/delete', async (req, res) => {
  const id = parseInt(req.body.postNum)
  console.log(id);
  try{
    const db = await getDB()
    await db.collection('posts').deleteOne({_id: id})
    res.redirect('/list')
  }catch(error){
    console.log(error)
  }
})

// app.listen(port);
app.listen(port, () => {
  console.log(`서버 실행중 ..! ${port}`);
});
