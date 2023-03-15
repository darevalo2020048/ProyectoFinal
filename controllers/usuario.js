const { response, request } = require('express');
const bcryptjs = require('bcryptjs');

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const getUsuarios = async (req = request, res = response) => {

    const listaUsuarios = await Promise.all([
        Usuario.countDocuments(),
        Usuario.find()
    ]);

    res.json({
        msg: 'Mostrar Usuarios',
        listaUsuarios
    });

}

const postUsuario = async (req = request, res = response) => {

    const { nombre, correo, password, rol } = req.body;
    const usuarioDB = new Usuario({ nombre, correo, password, rol });

    //Encriptar password
    const salt = bcryptjs.genSaltSync();
    usuarioDB.password = bcryptjs.hashSync(password, salt);

    //Guardar en Base de datos
    await usuarioDB.save();

    res.status(201).json({
        msg: 'Agregando Usuario',
        usuarioDB
    });

}

const putUsuario = async (req = request, res = response) => {

        const { id } = req.params;
    
        const { _id, rol, estado, ...resto } = req.body;
    
        const salt = bcryptjs.genSaltSync();
        resto.password = bcryptjs.hashSync(resto.password, salt);
    
        const usuarioEditado = await Usuario.findByIdAndUpdate(id, resto);
    
        res.json({
            msg: 'Editar Usuario',
            usuarioEditado
        });
}

const deleteUsuario = async (req = request, res = response) => {
        const { id } = req.params;
    
        const usuarioEliminado = await Usuario.findByIdAndDelete(id);
    
        res.json({
            msg: 'Eliminar Usuario',
            usuarioEliminado
        });
}

const putShopCar = async ( req = request, res = response) => {
    const data = {
        usuario: req.usuario._id
    }

    const agregarProducto = await Usuario.findOneAndUpdate(
        {_id: data.usuario},
        {$push: { carrito: req.body.producto }},
        {new : true}
    )
    let totalShopCar = 0;
    const usuario = await Usuario.findOne({_id: data.usuario})
    const ShopCarUser = usuario.carrito
    for(let ShopCarProduct of ShopCarUser){
        const producto = await Producto.findOne({_id: ShopCarProduct})
        totalShopCar = totalShopCar + producto.precio
    }
    const totalUser = await Usuario.findOneAndUpdate(
        {_id: data.usuario},
        {total: totalShopCar},
        {new: true}
    )
    res.status(201).json({
        agregarProducto,
        totalUser
    })
}

const putProductShopCar = async ( req = request, res = response) =>{
    const productId = req.params.id;

    const data = {
        usuario: req.usuario._id
    }

    const usuario = await Usuario.findOne({ _id: data.usuario});
    const ShopCarProducts = usuario.carrito

    let actualizarShopCar
    for (let ShopCarProduct of ShopCarProducts){
        actualizarShopCar = await Usuario.updateOne(
            {_id: data.usuario},
            {$pull: {carrito: productId}}
        )
    }
    let totalShopCar = 0;
    const users = await Usuario.findOne({_id: data.usuario})
    const ShopCarUser = users.carrito
    for (let ShopCarProduct of ShopCarUser) {
        const product = await Producto.findOne({_id: ShopCarProduct})
        totalShopCar = totalShopCar + product.precio
    }
    const totalUser = await Usuario.updateOne(
        {_id: data.usuario},
        {total: totalShopCar},
        {new: true}
    )

    res.status(410).json({
        actualizarShopCar,
        totalUser
    })
}

const EmptyShopCar = async(req = request, res = response) => {
    const {id} = req.params;

    const data = {
        usuario: req.usuario._id
    }

    const usuario = await Usuario.findOne({_id: data.usuario});
    let emptyShopCar = await Usuario.findOneAndUpdate(
        {_id: data.usuario},
        {carrito: []},
        {new: true}
    )
    let totalShopCar = 0;
    const users = await Usuario.findOne({_id: data.usuario})
    const ShopCarUser = users.carrito
    for (let ShopCarProduct of ShopCarUser){
        const producto = await Producto.findOne({_id: ShopCarProduct})
        totalShopCar = totalShopCar + producto.precio
    }
    const totalUser = await Usuario.updateOne(
        {_id: data.usuario},
        {total: totalShopCar},
        {new: true}
    )

    res.json({
        emptyShopCar,
        totalUser
    })
}

const getShopCar = async (req = request, res = response) => {
    const {id} = req.params

    const usuario = await Usuario.findOne({_id: id}).populate('carrito', 'nombre')
    const ShopCarProducts = usuario.carrito
    const totalShopCar = usuario.total

    res.json({
        ShopCarProducts,
        totalShopCar
    })
}

module.exports = {
    getUsuarios,
    postUsuario,
    putUsuario,
    deleteUsuario,
    putShopCar,
    putProductShopCar,
    EmptyShopCar,
    getShopCar,
    // PutCliente,
    // PostCliente,
    // borrarCliente
}