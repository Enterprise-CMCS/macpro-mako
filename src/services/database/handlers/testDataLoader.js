import * as dynamodb from '../../../libs/dynamodb-lib'

exports.handler = async (event, context) => {
  console.log('Request:', JSON.stringify(event, undefined, 2))
  try {
    let tableName = process.env.tableName
    console.log('Putting test data...')
    for (const item of event) {
      console.log(item)
      await dynamodb.putItem({
        tableName,
        item: { PK: item.recordId, SK: item.state },
      })
    }
    return 'SUCCESS'
  } catch (error) {
    console.log(error)
    throw 'ERROR'
  }
}
