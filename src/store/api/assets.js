import client from '@/store/api/client'

export default {
  getAssets(production, episode) {
    let path = '/api/data/assets/with-tasks'
    if (production) {
      path += `?project_id=${production.id}`
    }
    if (episode) {
      path += `&episode_id=${episode.id}`
    }
    return client.pget(path)
  },

  getSharedAssets(/* production */) {
    // const path = '/api/data/assets?is_shared=true'
    const path = '/api/data/assets/'
    // if (production) {
    //   path += `?project_id=${production.id}`
    // }
    return (
      client
        .pget(path)
        // FIXME: remove following mock data
        .then(assets => {
          return assets.map(entity => {
            const types = [
              { id: 1, name: 'type 1' },
              { id: 2, name: 'type 2' },
              { id: 3, name: 'type 3' }
            ]
            const randomType = types[Math.floor(Math.random() * 3)]
            return {
              ...entity,
              project_name: 'production',
              asset_type_id: randomType.id,
              asset_type_name: randomType.name
            }
          })
        })
    )
  },

  getAsset(assetId) {
    return client.getModel('assets', assetId, true)
  },

  newAsset(asset) {
    const data = {
      name: asset.name,
      description: asset.description,
      data: asset.data
    }
    if (asset.source_id !== 'null') {
      data.episode_id = asset.source_id
    }

    const path =
      `/api/data/projects/${asset.project_id}/asset-types/` +
      `${asset.entity_type_id}/assets/new`
    return client.ppost(path, data)
  },

  updateAsset(asset) {
    const data = {
      name: asset.name,
      description: asset.description,
      entity_type_id: asset.entity_type_id,
      project_id: asset.project_id,
      ready_for: asset.ready_for,
      data: asset.data
    }
    if (asset.is_casting_standby !== undefined) {
      data.is_casting_standby = Boolean(asset.is_casting_standby)
    }
    if (asset.source_id === 'null' || asset.source_id) {
      data.source_id = asset.source_id
    }
    return client.pput(`/api/data/entities/${asset.id}`, data)
  },

  deleteAsset(asset) {
    if (asset.canceled) {
      return client.pdel(`/api/data/assets/${asset.id}?force=true`)
    } else {
      return client.pdel(`/api/data/assets/${asset.id}`)
    }
  },

  restoreAsset(asset) {
    const data = { canceled: false }
    return client.pput(`/api/data/entities/${asset.id}`, data)
  },

  postCsv(production, formData, toUpdate) {
    let path = `/api/import/csv/projects/${production.id}/assets`
    if (toUpdate) path += '?update=true'
    return client.ppost(path, formData)
  }
}
