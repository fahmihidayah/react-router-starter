const sqlitePackages = ['better-sqlite3', '@libsql/client', '@libsql/client-wasm']

module.exports = {
  hooks: {
    readPackage(pkg) {
      for (const dependencyType of ['dependencies', 'optionalDependencies', 'peerDependencies']) {
        const dependencies = pkg[dependencyType]
        if (!dependencies) continue

        for (const packageName of sqlitePackages) {
          delete dependencies[packageName]
        }
      }

      return pkg
    },
  },
}
