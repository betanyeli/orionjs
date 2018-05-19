import PermissionsError from '../../Errors/PermissionsError'
import checkOptions from './checkOptions'
import validate from './validate'
import clean from './clean'
import getArgs from './getArgs'

export default function({
  params,
  requireUserId,
  returns,
  mutation,
  private: isPrivate,
  resolve,
  checkPermission
}) {
  checkOptions({
    params,
    requireUserId,
    returns,
    mutation,
    resolve,
    checkPermission
  })

  const resolver = async function(...args) {
    let {parent, callParams, viewer} = getArgs(...args)

    if (requireUserId && !viewer.userId) {
      throw new PermissionsError('notLoggedIn')
    }

    if (checkPermission) {
      const error = await checkPermission(callParams, viewer)
      if (error) {
        throw new PermissionsError(error)
      }
    }

    if (params) {
      const options = {}
      callParams = await clean(params, callParams, options, viewer)
      await validate(params, callParams, options, viewer)
    }

    if (parent) {
      return await resolve(parent, callParams, viewer)
    } else {
      return await resolve(callParams, viewer)
    }
  }

  resolver.params = params
  resolver.requireUserId = requireUserId
  resolver.returns = returns
  resolver.mutation = mutation
  resolver.checkPermission = checkPermission
  resolver.private = isPrivate
  resolver.resolve = resolver

  return resolver
}