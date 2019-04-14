import React, { Component } from "react";

import { MdInsertDriveFile } from "react-icons/md"
import { distanceInWords } from "date-fns";
import pt from "date-fns/locale/pt";
import socket from "socket.io-client";
import Dropzone from "react-dropzone";

import "./style.css";
import api from "../../services/api";


export default class Box extends Component {
    state = {
        box: {}
    };

    async componentDidMount(){
        this.subscribeToNewFiles();

        const box = this.props.match.params.id;
        const response = await api.get(`boxes/${box}`);
        this.setState({ box: response.data });
    }

    handleUpload = (files) => {
        files.forEach(file => {
            const data = new FormData();
            const box = this.props.match.params.id;

            data.append("file", file);
            api.post(`boxes/${box}/files`, data);
        });
    }

    subscribeToNewFiles = () => {
        console.log("OK");
        const box = this.props.match.params.id;
        const io = socket("https://file-upload-backend.herokuapp.com");
        
        io.emit("connectRoom", box);
        io.on("file", data => {
            console.log(data);
            this.setState({
                box: { ...this.state.box, files: [ data, ...this.state.box.files ] }
            });
        });
    };

    render(){
        return (
            <div id="box-container">
                <header>
                    <h1>{ this.state.box.title }</h1>
                </header>

                <Dropzone onDropAccepted={this.handleUpload}>
                    { ({ getRootProps, getInputProps }) => (
                        <div className="upload" { ...getRootProps() }>
                            <input { ...getInputProps() }/>
                            <p>Arraste arquivos ou clique aqui</p>
                        </div>
                    ) }
                </Dropzone>
                
                <ul>
                    { this.state.box.files && this.state.box.files.map(f => (
                       <li key={ f._id }>
                           <a className="fileInfo" href={ f.url } target="_blank">
                                <MdInsertDriveFile size={24} color="#A5Cfff"/>
                                <strong>{ f.title }</strong>
                           </a>
                           <span>ha{" "}{ distanceInWords(f.createdAt, new Date(), {locale: pt}) }</span>
                       </li> 
                    )) }
                </ul>
            </div>
        );
    }
}