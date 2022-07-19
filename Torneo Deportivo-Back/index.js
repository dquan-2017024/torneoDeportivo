'use strict'

const mongoConfig = require('./configs/mongoConfigs');
const app = require('./configs/app');
const port = 4000;
const User = require('./src/models/user.model');
const { encrypt } = require('./src/utils/validate');


mongoConfig.init();

app.listen(port, ()=>{
    console.log(`Server http is running in port ${port}`)
})

let admin = async()=>{
    let admin = await User.findOne({username: 'ADMIN'});
    if(!admin){
        let password = await encrypt('deportes123');
        let user = new User(
            {
            username: 'ADMIN', 
            password: password,
            name: 'ADMIN', 
            phone: '12345678',
            email: 'admin@gmail.com',
            role: 'ADMIN'}
        );
        user.save();
    }
} 
admin();
