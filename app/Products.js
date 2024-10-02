import conn from "./conn.js";
import checkAdminPermission from "./checkAdminPermission.js";
import nullOrUndefined from "./nullOrUndefined.js";
import trim from "./trim.js";
//Ezeket be kell importálni, amikor megcsináltuk a class-t, mert be lesznek ezzel hívva

class Products {
    checkData(product) {
        const errors = [];
        //itt ezt meghívhatjuk, mert akkor nem kell több helyen és ami bejön majd objektum azoknak az értékei trim()-elve lesznek 
        trim(product);

        if (nullOrUndefined(product.title) || product.title.length < 2) {
            errors.push("A címnek legalább 2 karakteresnek kell lennie!");
        }

        if (nullOrUndefined(product.productName) || product.productName.length < 2) {
            errors.push("A terméknévnek legalább 2 karakteresnek kell lennie!");
        }

        if (nullOrUndefined(product.productCategory) || product.productCategory.length === 0) {
            errors.push("A termékkategóriát kötelező kivélasztani!");
        }

        //description az ne legyen üres 
        if (nullOrUndefined(product.productDesc) || product.productDesc.length === 0) {
            errors.push("A leírás mező nem maradhat üres!");
        }

        //mert lehet az ár nulla is 
        if (nullOrUndefined(product.price) || product.price > 0) {
            errors.push("Az ár mező nem maradhat üres és nem lehet nullánál kisebb!");
        }

        /*
            A discountPrice nem lehet null vagy undefined, mert hogyha beküldjük a form-ot, akkor kell, hogy legyen 
            egy olyan mező, hogy discountPrice
            Viszont ha meg üres, akkor nem akartuk a terméknek discountPrice-t adni 
        */
        if (nullOrUndefined(product.discountPrice || product.discountPrice > 0)) {
            errors.push("A diszkont árat be kell állítani (Ha nulla, akkor nincs)!");
        }

        return errors;

    }

    async createProduct(product, userID, isAdmin) {
        checkAdminPermission(userID, isAdmin);
        const errors = this.checkData(product);

        if(errors.length > 0) {
            throw {
                status: 400,
                message: errors
            }
        }

        try {
            const response = await conn.promise().query(`
            INSERT INTO products (title, productName, productDesc, price, discountPrice)
            VALUES(?,?,?,?,?)`,
            [product.title, product.productName, product.productDesc, product.price, product.discountPrice]
            );

            if(response[0].affectedRows === 1) {
                return {
                    status: 200,
                    message: ["Sikeres létrehozás!"]
                }
            } else {
                throw {
                    status: 503, 
                    message: ["A szolgáltatás ideiglenesen nem érhető el!"]
                }
            }
            
        } catch(err) {
            console.log("Products.createProduct", err);

            if (err.status) {
                throw err;
            }

            throw {
                status: 503,
                message: ["A szolgáltatás jelenleg nem érhető el!"]
            }
        }


    }
}

export default Products;