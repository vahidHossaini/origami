
module.exports = class simpleBot
{
    constructor(config,dist,types)
    {
        this.types=types
        this.context=config.context
    }
    mainPage(msg,session,data,func)
    { 
        console.log('msg   ',msg)
        var obj={}
        obj.text="welcome to my bot , please select your language \r\n"+
                    "به بات من خوش آمدید. لطفا زبان خود را انتخاب کنید"
        obj.keys=[
            [{text:'English',callback_data:'a=engMenu'}],
            [{text:'فارسی',callback_data:'a=farMenu'}]
        ]
        obj.type='inline'
        return func(null,obj)
    }
    
    empty(msg,session,data,func)
    {
        var obj={}
        obj.text=""
        obj.keys=[
            [{text:'',callback_data:'a='}], 
        ]
        obj.type='inline'
        return func(null,obj)
    }
    enMenu(msg,session,data,func)
    {
        var obj={}
        obj.text="welcome to OrigamiCore Bot, you can create and publish your bot as soon as posible ."
        obj.keys=[
            [{text:'about',callback_data:'a=enAbout'}],
            [{text:'Photo',callback_data:'a=enPhoto'},{text:'Video',callback_data:'a=enVideo'},],
            [{text:'Audio',callback_data:'a=enAudio'},{text:'Document',callback_data:'a=enDocument'},]
        ]
        obj.type='inline'
        return func(null,obj)
    }
    enAbout(msg,session,data,func)
    {
        var obj={}
        obj.text="OrigamiCore is farmework for small and medium project.\r\n"+
        "for more detail visite : https://github.com/vahidHossaini/origami"
        obj.keys=[
            [{text:'back',callback_data:'a=back'}], 
        ]
        obj.type='inline'
        return func(null,obj)
    }
    enDocument(msg,session,data,func)
    {
        var obj={}
        obj.text="example send Document"
        obj.fileType=this.types.Document
        obj.path="./files/doc.rar"
        obj.keys=[
            [{text:'back',callback_data:'a=back'}], 
        ]
        obj.cache=true
        obj.type='inline'
        return func(null,obj)
    }
    enAudio(msg,session,data,func)
    {
        var obj={}
        obj.text="example send Audio"
        obj.fileType=this.types.Audio
        obj.path="./files/audio.mp3"
        obj.keys=[
            [{text:'back',callback_data:'a=back'}], 
        ]
        obj.cache=true
        obj.type='inline'
        return func(null,obj)
    }
    enVideo(msg,session,data,func)
    {
        var obj={}
        obj.text="example send video"
        obj.fileType=this.types.Video
        obj.path="./files/vid.mp4"
        obj.keys=[
            [{text:'back',callback_data:'a=back'}], 
        ]
        obj.cache=true
        obj.type='inline'
        return func(null,obj)
    }
    enPhoto(msg,session,data,func)
    {
        var obj={}
        obj.text="example send picture"
        obj.fileType=this.types.Photo
        obj.path="./files/pic.jpg"
        obj.keys=[
            [{text:'back',callback_data:'a=back'}], 
        ]
        obj.cache=true
        obj.type='inline'
        return func(null,obj)
    }
    faMenu(msg,session,data,func)
    {
        var obj={}
        obj.text="به بات اوریگامی کر خوش آمدید.شما میتوانید بات خود را در سریعترین زمان ممکن درست کنید و انتشار دهید"
        obj.keys=[
            [{text:'درباره ما',callback_data:'a=faAbout'}],
            [{text:'عکس',callback_data:'a=faPhoto'},{text:'فیلم',callback_data:'a=faVideo'},],
            [{text:'صدا',callback_data:'a=faAudio'},{text:'فایل',callback_data:'a=faDocument'},]
        ]
        obj.type='inline'
        return func(null,obj)
    }
    
    faAbout(msg,session,data,func)
    {
        var obj={}
        obj.text="اریگامی کر فریم ورکی برای پروژه های کوچک و متوسط می باشد.\r\n"+
        "برای اطلاعات بیشتر به لینک زیر مراجعه کنید : https://github.com/vahidHossaini/origami"
        obj.keys=[
            [{text:'back',callback_data:'a=back'}], 
        ]
        obj.type='inline'
        return func(null,obj)
    }
    faDocument(msg,session,data,func)
    {
        var obj={}
        obj.text="نمونه ای از ارسال فایل"
        obj.fileType=this.types.Document
        obj.path="./files/doc.rar"
        obj.keys=[
            [{text:'back',callback_data:'a=back'}], 
        ]
        obj.cache=true
        obj.type='inline'
        return func(null,obj)
    }
    faAudio(msg,session,data,func)
    {
        var obj={}
        obj.text="نمونه ای از ارسال صوت"
        obj.fileType=this.types.Audio
        obj.path="./files/audio.mp3"
        obj.keys=[
            [{text:'back',callback_data:'a=back'}], 
        ]
        obj.cache=true
        obj.type='inline'
        return func(null,obj)
    }
    faVideo(msg,session,data,func)
    {
        var obj={}
        obj.text="نمونه ای از ارسال ویدیو"
        obj.fileType=this.types.Video
        obj.path="./files/vid.mp4"
        obj.keys=[
            [{text:'back',callback_data:'a=back'}], 
        ]
        obj.cache=true
        obj.type='inline'
        return func(null,obj)
    }
    faPhoto(msg,session,data,func)
    {
        var obj={}
        obj.text="نمونه ای از ارسال عکس"
        obj.fileType=this.types.Photo
        obj.path="./files/pic.jpg"
        obj.keys=[
            [{text:'back',callback_data:'a=back'}], 
        ]
        obj.cache=true
        obj.type='inline'
        return func(null,obj)
    }
}