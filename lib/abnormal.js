'use strict'

const ID_ENRAGE = 8888888
const entities = new Map()

module.exports = function AbnormalManager(mod){
    mod.hook('S_ABNORMALITY_BEGIN', 3, addAbnormal)
    mod.hook('S_ABNORMALITY_REFRESH', 1, refreshAbnormal)
    mod.hook('S_ABNORMALITY_END', 1, removeAbnormal)
    mod.hook('S_LOAD_TOPO', 'event', () => {
        entities.clear()
    })

    mod.hook('S_NPC_STATUS', 2, (event) => {
        const entity = getEntity(event.gameId)
        if(event.enraged) {
            if(!entity.get('enraged'))
                addAbnormal({
                    target: event.gameId,
                    source: {},
                    id: ID_ENRAGE,
                    duration: event.remainingEnrageTime,
                    stacks: 1
                })
            entity.set('enraged', true)
        } else {
            if(entity.get('enraged'))
                removeAbnormal({
                    target: event.gameId,
                    id: ID_ENRAGE
                })
            entity.set('enraged', false)
        }
    })

    function abnormalIcon(id){
        let icon
        if(id === ID_ENRAGE){
            icon = `<img src='img://item__8626' width='48' height='48' vspace='-7' />`
        } else {
            icon = `<img src='img://abonormality__${id}' width='48' height='48' vspace='-7' />`
        }
        return icon
    }
    function getEntity(id){
        if(!id) return false
        id = id.toString()
        if(!entities.has(id)) entities.set(id, new Map())
        return entities.get(id)
    }
    function getAbnormal(entityId, abnormalId){
        const entity = getEntity(entityId)
        if(!entity.has(abnormalId)) entity.set(abnormalId, {})
        const abnormal = entity.get(abnormalId)
        if(!abnormal.icon) abnormal.icon = abnormalIcon(abnormalId)
        return abnormal
    }
    function addAbnormal(event){
        const abnormal = getAbnormal(event.target, event.id)
        abnormal.added = Date.now()
        abnormal.expires = Date.now() + event.duration
        abnormal.stacks = event.stacks
        delete abnormal.refreshed
        delete abnormal.removed
    }
    function refreshAbnormal(event){
        const abnormal = getAbnormal(event.target, event.id)
        if(!abnormal.added)
            abnormal.added = Date.now()
        if(event.stacks !== abnormal.stacks)
            abnormal.refreshed = Date.now()
        abnormal.expires = Date.now() + event.duration
        abnormal.stacks = event.stacks
    }
    function removeAbnormal(event){
        const abnormal = getAbnormal(event.target, event.id)
        abnormal.removed = Date.now()
        delete abnormal.added
        delete abnormal.refreshed
        delete abnormal.expires
        delete abnormal.stacks
    }
    this.get = getAbnormal
}
