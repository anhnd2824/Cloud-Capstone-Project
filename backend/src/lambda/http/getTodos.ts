import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getTodosForUser as getTodosForUser } from '../../helpers/todos'
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger'

const logger = createLogger('getTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId: string = getUserId(event);
    logger.info('User id ' + userId)

    const todos = await getTodosForUser(userId);
    logger.info('Todos list: ' + todos)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        items: todos
      })
    }
  }
)

handler.use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
