import * as mongoose from 'mongoose'

mongoose.connect(process.env.MONGO, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('connected to mongo'))

mongoose.set('useCreateIndex', true)

export * from './ChatInfo'
