import { Controller, Get, Query } from '@nestjs/common';
import PageContentReader from './PageContentReader';

@Controller('page-content-reader')
export default class PageContentReaderController{

   private pageContentReader = new PageContentReader();

  @Get()
  async handleUrl(@Query('requestURL') inputURL: string) {
       let response = await this.pageContentReader.getReadableContent(inputURL);

       const lines = response.content
          .split('\n')
          .map(line => {
            // console.log(`--> ${line}`)
            return line.trim()
          })
          .filter(line => line.length > 0)
          .map(i=>{
            return {line:i}
           });
        
        let newLines:any[] = [];

        for(let eachLine of lines){
          if(eachLine.line.toLowerCase().indexOf(`Tap the screen to use advanced tools Tip`.toLowerCase())>=0){
            break;
          }
          newLines.push(eachLine);
        }

        return {
            nextChapterURL : response.nextChapterURL,
            novelName : "",
            chapterHeading : "",
            items : newLines
        };  

  }
}