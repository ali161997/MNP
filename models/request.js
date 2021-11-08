module.exports = (sequelize, DataTypes) => {
    const Request = sequelize.define('requests', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        organization: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: true,
        },
        state: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        donor: {
            type: DataTypes.STRING,
            allowNull: false

        }
    })
    return Request;
}