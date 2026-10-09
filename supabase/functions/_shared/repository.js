export function workspaceRepository(client) {
  const table = () => client.from('renter_workspaces');
  async function result(query) {
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
  return {
    owned: ownerId => result(table().select('*').eq('owner_id', ownerId).maybeSingle()),
    public: publicId => result(table().select('*').eq('public_id', publicId).maybeSingle()),
    async create(ownerId, state) {
      // Ignore a concurrent first visit; never overwrite an existing business.
      await result(table().upsert({ owner_id: ownerId, data: state }, { onConflict: 'owner_id', ignoreDuplicates: true }));
      return this.owned(ownerId);
    },
    save: (row, state) => result(table().update({ data: state, revision: row.revision + 1, updated_at: new Date().toISOString() })
      .eq('owner_id', row.owner_id).eq('revision', row.revision).select('revision').maybeSingle()),
  };
}
